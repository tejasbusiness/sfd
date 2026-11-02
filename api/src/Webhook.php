<?php
declare(strict_types=1);

namespace Sfd;

/**
 * Posts events (new leads) to the n8n webhook (docs/15). Same pattern as Mailer: the event is
 * written to webhook_outbox first, delivered AFTER the HTTP response has been sent (so n8n
 * never slows a visitor down), and retried with backoff by api/bin/send-webhooks.php if it fails.
 *
 * Authentication is a shared secret in the X-SFD-Webhook-Secret header, checked by the n8n
 * Webhook node (Header Auth credential). The URL must be https outside a local environment so
 * the secret is never sent in clear text. From a local environment nothing is posted unless
 * WEBHOOK_LOCAL=1 and the row is marked "failed (skipped)", so test leads never alert the owner.
 */
final class Webhook
{
    public const MAX_ATTEMPTS = 8;

    /** Minutes to wait before the next attempt, indexed by attempts already made (1 = after the first failure). */
    private const BACKOFF_MINUTES = [1 => 1, 2 => 2, 3 => 5, 4 => 10, 5 => 20, 6 => 40, 7 => 60];

    /** @var list<int> outbox rows waiting to be delivered after the response */
    private static array $pending = [];
    private static bool $shutdownRegistered = false;

    /**
     * @param array<string,mixed> $payload sent as the JSON body
     */
    public static function enqueue(string $event, array $payload, ?string $relatedType = null, ?int $relatedId = null): void
    {
        try {
            $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            Db::run(
                'INSERT INTO webhook_outbox (event, payload, related_type, related_id, next_attempt_at)
                 VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
                [$event, $json, $relatedType, $relatedId]
            );
            self::deliverAfterResponse(Db::insertId());
        } catch (\Throwable $e) {
            // Never break the visitor's submission because the alert could not be queued.
            error_log('Webhook::enqueue failed: ' . $e->getMessage());
        }
    }

    private static function deliverAfterResponse(int $id): void
    {
        self::$pending[] = $id;
        if (self::$shutdownRegistered) {
            return;
        }
        self::$shutdownRegistered = true;
        register_shutdown_function(static function (): void {
            if (function_exists('fastcgi_finish_request')) {
                fastcgi_finish_request();
            }
            ignore_user_abort(true);
            set_time_limit(60);
            foreach (self::$pending as $id) {
                try {
                    self::deliver($id);
                } catch (\Throwable $e) {
                    error_log('Webhook::deliver failed: ' . $e->getMessage());
                }
            }
            self::$pending = [];
        });
    }

    public static function deliver(int $id): void
    {
        $row = Db::run('SELECT * FROM webhook_outbox WHERE id = ?', [$id])->fetch();
        if (!$row || $row['status'] === 'sent') {
            return;
        }

        if (Env::isLocal() && Env::get('WEBHOOK_LOCAL', '0') !== '1') {
            Db::run("UPDATE webhook_outbox SET status = 'failed', last_error = 'skipped (local environment)' WHERE id = ?", [$id]);
            return;
        }

        $url = Env::get('N8N_WEBHOOK_URL');
        $secret = Env::get('N8N_WEBHOOK_SECRET');
        if ($url === null || $secret === null) {
            // Not configured yet: keep it queued without using up an attempt, and look again later.
            Db::run(
                "UPDATE webhook_outbox SET last_error = 'N8N_WEBHOOK_URL or N8N_WEBHOOK_SECRET is not set', next_attempt_at = UTC_TIMESTAMP() + INTERVAL 10 MINUTE WHERE id = ?",
                [$id]
            );
            return;
        }
        if (!str_starts_with($url, 'https://') && !Env::isLocal()) {
            Db::run(
                "UPDATE webhook_outbox SET status = 'failed', last_error = 'N8N_WEBHOOK_URL must be https' WHERE id = ?",
                [$id]
            );
            return;
        }

        $code = 0;
        $error = null;
        try {
            $ch = curl_init($url);
            if ($ch === false) {
                throw new \RuntimeException('curl_init failed');
            }
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $row['payload'],
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'X-SFD-Webhook-Secret: ' . $secret,
                    'X-SFD-Event: ' . $row['event'],
                    'X-SFD-Delivery: ' . $row['id'],
                    'X-SFD-Timestamp: ' . time(),
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_PROTOCOLS => Env::isLocal() ? (CURLPROTO_HTTP | CURLPROTO_HTTPS) : CURLPROTO_HTTPS,
            ]);
            $response = curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            if ($response === false) {
                $error = curl_error($ch) ?: 'request failed';
            } elseif ($code < 200 || $code > 299) {
                $error = 'HTTP ' . $code;
            }
            curl_close($ch);
        } catch (\Throwable $e) {
            $error = $e->getMessage();
        }

        if ($error === null) {
            Db::run(
                "UPDATE webhook_outbox SET status = 'sent', sent_at = UTC_TIMESTAMP(), attempts = attempts + 1, last_status_code = ?, last_error = NULL WHERE id = ?",
                [$code, $id]
            );
            return;
        }

        $attempts = (int) $row['attempts'] + 1;
        $failed = $attempts >= self::MAX_ATTEMPTS;
        Db::run(
            'UPDATE webhook_outbox SET status = ?, attempts = ?, last_status_code = ?, last_error = ?, next_attempt_at = UTC_TIMESTAMP() + INTERVAL ? MINUTE WHERE id = ?',
            [$failed ? 'failed' : 'queued', $attempts, $code ?: null, mb_substr($error, 0, 500), self::BACKOFF_MINUTES[$attempts] ?? 60, $id]
        );
        error_log("Webhook::deliver attempt {$attempts} failed for outbox {$id}: {$error}");
    }
}
