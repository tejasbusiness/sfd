<?php
declare(strict_types=1);

/**
 * Retries queued n8n webhooks (webhook_outbox rows that failed to post but have attempts left)
 * and deletes sent rows older than 30 days (their payload repeats the lead's contact details).
 * Run from cron on the server, e.g. every 5 minutes:
 *   php /home/<site user>/htdocs/<domain>/api/bin/send-webhooks.php
 * Uses the production .env unless --env=local is given.
 */

require __DIR__ . '/../src/bootstrap.php';

use Sfd\Db;
use Sfd\Env;
use Sfd\Webhook;

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$root = dirname(__DIR__, 2);
$options = getopt('', ['env::', 'env-file::']);
$envFile = isset($options['env-file'])
    ? (string) $options['env-file']
    : $root . '/' . (($options['env'] ?? 'production') === 'local' ? '.env-local' : '.env');
Env::load($envFile);

$rows = Db::run(
    "SELECT id FROM webhook_outbox WHERE status = 'queued' AND attempts < ? AND next_attempt_at <= UTC_TIMESTAMP() ORDER BY id LIMIT 50",
    [Webhook::MAX_ATTEMPTS]
)->fetchAll();

foreach ($rows as $row) {
    Webhook::deliver((int) $row['id']);
}

$purged = Db::run("DELETE FROM webhook_outbox WHERE status = 'sent' AND sent_at < UTC_TIMESTAMP() - INTERVAL 30 DAY")->rowCount();
echo count($rows) . " queued webhook(s) processed, {$purged} old sent row(s) removed.\n";
