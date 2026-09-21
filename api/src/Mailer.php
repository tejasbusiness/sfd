<?php
declare(strict_types=1);

namespace Sfd;

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Every email is written to email_outbox first and then sent, so a failed SMTP call
 * never loses a lead and can be retried with api/bin/send-outbox.php.
 * From a local environment nothing is sent unless MAIL_LOCAL=1, and the row is marked
 * "failed (skipped)" so the production retry job never sends test mail.
 */
final class Mailer
{
    /** @var array<int,array{0:int,1:?string}> outbox rows waiting to be delivered after the response */
    private static array $pending = [];
    private static bool $shutdownRegistered = false;

    /**
     * Queues the email (a fast database insert) and delivers it AFTER the HTTP response
     * has been sent, so a slow SMTP connection never makes the visitor wait. If delivery
     * fails the row stays queued for api/bin/send-outbox.php.
     *
     * @param array<string,string> $rows label => value, shown as a table
     */
    public static function send(string $template, string $toEmail, ?string $toName, string $subject, string $intro, array $rows, ?string $relatedType = null, ?int $relatedId = null, ?string $replyTo = null): void
    {
        [$html, $text] = self::render($subject, $intro, $rows);
        try {
            Db::run(
                'INSERT INTO email_outbox (template, to_email, to_name, subject, body_html, body_text, related_type, related_id, send_after)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())',
                [$template, $toEmail, $toName, $subject, $html, $text, $relatedType, $relatedId]
            );
            self::deliverAfterResponse(Db::insertId(), $replyTo);
        } catch (\Throwable $e) {
            error_log('Mailer::send failed: ' . $e->getMessage());
        }
    }

    private static function deliverAfterResponse(int $id, ?string $replyTo): void
    {
        self::$pending[] = [$id, $replyTo];
        if (self::$shutdownRegistered) {
            return;
        }
        self::$shutdownRegistered = true;
        register_shutdown_function(static function (): void {
            // Sends the response to the browser now and keeps this process running (PHP-FPM).
            if (function_exists('fastcgi_finish_request')) {
                fastcgi_finish_request();
            }
            ignore_user_abort(true);
            set_time_limit(120);
            foreach (self::$pending as [$id, $replyTo]) {
                try {
                    self::deliver($id, $replyTo);
                } catch (\Throwable $e) {
                    error_log('Mailer::deliver failed: ' . $e->getMessage());
                }
            }
            self::$pending = [];
        });
    }

    public static function deliver(int $id, ?string $replyTo = null): void
    {
        $row = Db::run('SELECT * FROM email_outbox WHERE id = ?', [$id])->fetch();
        if (!$row || $row['status'] === 'sent') {
            return;
        }

        if (Env::isLocal() && Env::get('MAIL_LOCAL', '0') !== '1') {
            Db::run("UPDATE email_outbox SET status = 'failed', last_error = 'skipped (local environment)' WHERE id = ?", [$id]);
            return;
        }

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = Env::require('SMTP_HOST');
            $mail->Port = (int) Env::get('SMTP_PORT', '465');
            $mail->SMTPAuth = true;
            $mail->Username = Env::require('SMTP_USER');
            $mail->Password = Env::require('SMTP_PASSWORD');
            $secure = Env::get('SMTP_SECURE', 'ssl');
            $mail->SMTPSecure = $secure === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : ($secure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : '');
            $mail->Timeout = 20;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(Env::require('MAIL_FROM'), Env::get('MAIL_FROM_NAME', 'SynergyFirst Digital') ?? '');
            $mail->addAddress($row['to_email'], (string) $row['to_name']);
            if ($replyTo !== null) {
                $mail->addReplyTo($replyTo);
            }
            $mail->Subject = $row['subject'];
            $mail->isHTML(true);
            $mail->Body = $row['body_html'];
            $mail->AltBody = $row['body_text'];
            $mail->send();

            Db::run("UPDATE email_outbox SET status = 'sent', sent_at = UTC_TIMESTAMP(), attempts = attempts + 1, last_error = NULL WHERE id = ?", [$id]);
        } catch (MailException | \Throwable $e) {
            Db::run(
                "UPDATE email_outbox SET status = IF(attempts + 1 >= 5, 'failed', 'queued'), attempts = attempts + 1, last_error = ? WHERE id = ?",
                [mb_substr($e->getMessage(), 0, 500), $id]
            );
            error_log('Mailer::deliver failed: ' . $e->getMessage());
        }
    }

    /** @return array{0:string,1:string} html, text */
    private static function render(string $heading, string $intro, array $rows): array
    {
        $e = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $html = '<div style="font-family:Arial,sans-serif;color:#160224;max-width:560px">'
            . '<h2 style="margin:0 0 12px">' . $e($heading) . '</h2>'
            . '<p style="line-height:1.5">' . nl2br($e($intro)) . '</p>';
        $text = $heading . "\n\n" . $intro . "\n\n";
        if ($rows) {
            $html .= '<table style="border-collapse:collapse;width:100%">';
            foreach ($rows as $label => $value) {
                $html .= '<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#5F5168;white-space:nowrap">' . $e((string) $label)
                    . '</td><td style="padding:6px 0">' . nl2br($e($value)) . '</td></tr>';
                $text .= $label . ': ' . $value . "\n";
            }
            $html .= '</table>';
        }
        $html .= '<p style="color:#5F5168;font-size:12px;margin-top:24px">SynergyFirst Digital</p></div>';
        return [$html, $text];
    }
}
