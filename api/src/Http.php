<?php
declare(strict_types=1);

namespace Sfd;

/** Request/response helpers. Responses are always JSON and never include internals. */
final class Http
{
    private const MAX_BODY_BYTES = 65536;

    public static function json(int $status, array $body): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** Cross-site form posts are refused: the Origin header, when present, must be allow-listed. */
    public static function checkOrigin(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '') {
            return;
        }
        $allowed = array_filter(array_map('trim', explode(',', Env::get('ALLOWED_ORIGINS', '') ?? '')));
        if (!in_array($origin, $allowed, true)) {
            self::json(403, ['ok' => false, 'error' => 'forbidden']);
        }
    }

    /** @return array<string,mixed> */
    public static function body(): array
    {
        $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
        if (!str_starts_with($type, 'application/json')) {
            self::json(415, ['ok' => false, 'error' => 'unsupported_media_type']);
        }
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY_BYTES + 1) ?: '';
        if (strlen($raw) > self::MAX_BODY_BYTES) {
            self::json(413, ['ok' => false, 'error' => 'payload_too_large']);
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            self::json(400, ['ok' => false, 'error' => 'invalid_json']);
        }
        return $data;
    }

    /**
     * The visitor's address. Behind the local nginx proxy REMOTE_ADDR is 127.0.0.1, so the
     * X-Real-IP header set by our own nginx is trusted, but only when the request really
     * came through that local proxy (otherwise the header could be forged).
     */
    public static function clientIp(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        if ($remote === '127.0.0.1' || $remote === '::1') {
            $forwarded = trim((string) ($_SERVER['HTTP_X_REAL_IP'] ?? ''));
            if ($forwarded !== '' && filter_var($forwarded, FILTER_VALIDATE_IP)) {
                return $forwarded;
            }
        }
        return $remote;
    }

    public static function ipHash(): string
    {
        return hash_hmac('sha256', self::clientIp(), Env::require('RATE_LIMIT_SALT'));
    }

    public static function userAgent(): ?string
    {
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        return $ua === '' ? null : mb_substr($ua, 0, 255);
    }
}
