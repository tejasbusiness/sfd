<?php
declare(strict_types=1);

/**
 * Retries queued emails (email_outbox rows that failed to send but have attempts left).
 * Run from cron on the server, e.g. every 10 minutes:
 *   php /home/<site user>/htdocs/<domain>/api/bin/send-outbox.php
 * Uses the production .env unless --env=local is given.
 */

require __DIR__ . '/../src/bootstrap.php';

use Sfd\Db;
use Sfd\Env;
use Sfd\Mailer;

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$root = dirname(__DIR__, 2);
$options = getopt('', ['env::']);
Env::load($root . '/' . (($options['env'] ?? 'production') === 'local' ? '.env-local' : '.env'));

$rows = Db::run(
    "SELECT id FROM email_outbox WHERE status = 'queued' AND attempts < 5 AND send_after <= UTC_TIMESTAMP() ORDER BY id LIMIT 50"
)->fetchAll();

foreach ($rows as $row) {
    Mailer::deliver((int) $row['id']);
}
echo count($rows) . " queued email(s) processed.\n";
