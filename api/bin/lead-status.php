<?php
declare(strict_types=1);

/**
 * Moves a Free Preview request along the funnel and logs unpaid production time (docs/14).
 *   php api/bin/lead-status.php <reference> <status> [--minutes=N] [--env=local]
 *   php api/bin/lead-status.php <reference> --minutes=N        (log time only)
 * Statuses: new, reviewing, qualified, declined, preview_sent, activated (paid), expired.
 * --minutes adds to the request's running total; it never overwrites it.
 */

require __DIR__ . '/../src/bootstrap.php';

use Sfd\Db;
use Sfd\Env;

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$statuses = ['new', 'reviewing', 'qualified', 'declined', 'preview_sent', 'activated', 'expired'];
$args = array_values(array_filter(array_slice($argv, 1), static fn ($a) => !str_starts_with($a, '--')));
$options = getopt('', ['env::', 'minutes::']);
$reference = $args[0] ?? '';
$status = $args[1] ?? null;
$minutes = isset($options['minutes']) ? (int) $options['minutes'] : 0;

if ($reference === '' || ($status === null && $minutes === 0) || ($status !== null && !in_array($status, $statuses, true)) || $minutes < 0) {
    fwrite(STDERR, "Usage: php api/bin/lead-status.php <reference> [" . implode('|', $statuses) . "] [--minutes=N] [--env=local]\n");
    exit(1);
}

$root = dirname(__DIR__, 2);
Env::load($root . '/' . (($options['env'] ?? 'production') === 'local' ? '.env-local' : '.env'));

$row = Db::run('SELECT id, status, production_minutes FROM preview_applications WHERE reference = ?', [$reference])->fetch();
if (!$row) {
    fwrite(STDERR, "No preview request with reference {$reference}.\n");
    exit(1);
}

if ($status !== null && $status !== $row['status']) {
    Db::run('UPDATE preview_applications SET status = ?, status_changed_at = UTC_TIMESTAMP() WHERE id = ?', [$status, $row['id']]);
}
if ($minutes > 0) {
    Db::run('UPDATE preview_applications SET production_minutes = production_minutes + ? WHERE id = ?', [$minutes, $row['id']]);
}

$after = Db::run('SELECT status, production_minutes FROM preview_applications WHERE id = ?', [$row['id']])->fetch();
echo "{$reference}: status {$after['status']}, production time {$after['production_minutes']} min.\n";
