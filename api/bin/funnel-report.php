<?php
declare(strict_types=1);

/**
 * Prints the Free Preview funnel for the last N days (docs/14 "Funnel tracking"):
 * preview CTA clicks -> form starts -> submitted -> qualified -> preview delivered -> paid,
 * plus unpaid production hours per paying customer. Test rows are excluded.
 *   php api/bin/funnel-report.php [--days=30] [--env=local]
 * A request counts for a later step when its status is that step or beyond, so a paid
 * customer also counts as qualified and delivered.
 */

require __DIR__ . '/../src/bootstrap.php';

use Sfd\Db;
use Sfd\Env;

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$options = getopt('', ['env::', 'days::']);
$days = max(1, (int) ($options['days'] ?? 30));
$root = dirname(__DIR__, 2);
Env::load($root . '/' . (($options['env'] ?? 'production') === 'local' ? '.env-local' : '.env'));

$event = static fn (string $name): int => (int) Db::run(
    'SELECT COUNT(*) FROM funnel_events WHERE event = ? AND created_at > (UTC_TIMESTAMP() - INTERVAL ? DAY)',
    [$name, $days]
)->fetchColumn();

$leads = Db::run(
    "SELECT
       COUNT(*) AS submitted,
       SUM(status IN ('qualified','preview_sent','activated')) AS qualified,
       SUM(status IN ('preview_sent','activated')) AS delivered,
       SUM(status = 'activated') AS paid,
       COALESCE(SUM(production_minutes), 0) AS minutes
     FROM preview_applications
     WHERE is_test = 0 AND created_at > (UTC_TIMESTAMP() - INTERVAL ? DAY)",
    [$days]
)->fetch();

$steps = [
    'Preview CTA clicks' => $event('cta_click'),
    'Form starts' => $event('form_start'),
    'Submitted requests' => (int) $leads['submitted'],
    'Qualified' => (int) $leads['qualified'],
    'Preview delivered' => (int) $leads['delivered'],
    'Paid subscriptions' => (int) $leads['paid'],
];

echo "Free Preview funnel, last {$days} days\n";
$previous = null;
foreach ($steps as $label => $count) {
    $rate = ($previous !== null && $previous > 0) ? sprintf('  (%d%% of previous step)', (int) round($count * 100 / $previous)) : '';
    printf("  %-20s %6d%s\n", $label, $count, $rate);
    $previous = $count;
}
$hours = ((int) $leads['minutes']) / 60;
printf("  %-20s %6.1f\n", 'Production hours', $hours);
printf("  %-20s %s\n", 'Hours per customer', $steps['Paid subscriptions'] > 0 ? sprintf('%.1f', $hours / $steps['Paid subscriptions']) : 'n/a (no paid customers yet)');
