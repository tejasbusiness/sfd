<?php
declare(strict_types=1);

namespace Sfd;

/** Per-IP limits stored in MySQL (IP addresses are only ever kept as a salted hash). */
final class RateLimit
{
    // Two kinds of bucket. A plain bucket ('contact') counts every request, including ones
    // rejected by validation, so it is generous: it only stops floods. A '_saved' bucket is
    // counted only once a submission passed validation and is about to be stored, so it is
    // the real anti-spam limit and a visitor fixing typos is never blocked by it.
    private const LIMITS = [
        'contact' => [30, 3600],
        'contact_saved' => [5, 3600],
        'preview' => [30, 3600],
        'preview_saved' => [5, 3600],
        'playbook' => [30, 3600],
        'playbook_saved' => [5, 3600],
        'booking' => [30, 3600],
        'booking_saved' => [8, 3600],
        'availability' => [120, 600],
        'consent' => [60, 3600],
    ];

    public static function hit(string $bucket): void
    {
        [$max, $window] = self::LIMITS[$bucket];
        $ip = Http::ipHash();

        $count = (int) Db::run(
            'SELECT COUNT(*) FROM rate_limits WHERE bucket = ? AND ip_hash = ? AND created_at > (UTC_TIMESTAMP() - INTERVAL ? SECOND)',
            [$bucket, $ip, $window]
        )->fetchColumn();

        if ($count >= $max) {
            header('Retry-After: ' . $window);
            Http::json(429, ['ok' => false, 'error' => 'rate_limited']);
        }
        Db::run('INSERT INTO rate_limits (bucket, ip_hash, created_at) VALUES (?, ?, UTC_TIMESTAMP())', [$bucket, $ip]);

        // Housekeeping: drop rows older than a day on roughly 1 in 50 requests.
        if (random_int(1, 50) === 1) {
            Db::run('DELETE FROM rate_limits WHERE created_at < (UTC_TIMESTAMP() - INTERVAL 1 DAY)');
        }
    }
}
