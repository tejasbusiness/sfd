<?php
declare(strict_types=1);

/**
 * Forward-only SQL migration runner.
 *
 *   php api/bin/migrate.php                 apply pending migrations using .env-local (via the SSH tunnel)
 *   php api/bin/migrate.php --env=production   use .env (run this on the server)
 *   php api/bin/migrate.php --status        list applied / pending, change nothing
 *   php api/bin/migrate.php --dry-run       show what would run, change nothing
 *
 * Files in migrations/ run in filename order. Applied files are recorded with a
 * checksum in schema_migrations; editing an applied file is an error (add a new file).
 * MySQL DDL cannot be rolled back, so each file is split into statements and a
 * failure stops the run with the file left unrecorded, ready to fix and re-run.
 */

require __DIR__ . '/../src/Env.php';

use Sfd\Env;

if (PHP_SAPI !== 'cli') {
    exit("CLI only\n");
}

$root = dirname(__DIR__, 2);
$options = getopt('', ['env::', 'status', 'dry-run']);
$target = $options['env'] ?? 'local';
$envFile = $root . DIRECTORY_SEPARATOR . ($target === 'production' ? '.env' : '.env-local');
$status = isset($options['status']);
$dryRun = isset($options['dry-run']);

try {
    Env::load($envFile);
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        Env::require('DB_HOST'),
        (int) Env::get('DB_PORT', '3306'),
        Env::require('DB_NAME')
    );
    $pdo = new PDO($dsn, Env::require('DB_USER'), Env::get('DB_PASSWORD', ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    fwrite(STDERR, "Cannot connect ({$envFile}): " . $e->getMessage() . "\n");
    fwrite(STDERR, "Local runs need the SSH tunnel open first: npm run tunnel\n");
    exit(1);
}

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(190) NOT NULL,
        checksum CHAR(64) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$applied = [];
foreach ($pdo->query('SELECT filename, checksum FROM schema_migrations') as $row) {
    $applied[$row['filename']] = $row['checksum'];
}

$files = glob($root . '/migrations/*.sql') ?: [];
sort($files, SORT_STRING);

$pending = [];
foreach ($files as $file) {
    $name = basename($file);
    $checksum = hash('sha256', (string) file_get_contents($file));
    if (isset($applied[$name])) {
        if ($applied[$name] !== $checksum) {
            fwrite(STDERR, "ERROR: {$name} was changed after it was applied. Revert it and add a new migration.\n");
            exit(1);
        }
        echo "  applied  {$name}\n";
        continue;
    }
    $pending[$name] = [$file, $checksum];
    echo "  pending  {$name}\n";
}

foreach (array_keys($applied) as $name) {
    if (!is_file($root . '/migrations/' . $name)) {
        fwrite(STDERR, "WARNING: {$name} is recorded as applied but the file is missing.\n");
    }
}

if ($status || $dryRun || !$pending) {
    echo $pending ? "\n" . count($pending) . " pending migration(s).\n" : "\nDatabase is up to date.\n";
    exit(0);
}

/** Splits a migration file into statements, dropping "--" comment lines. */
function statements(string $sql): array
{
    $lines = array_filter(explode("\n", str_replace("\r\n", "\n", $sql)), static fn ($l) => !str_starts_with(ltrim($l), '--'));
    $parts = preg_split('/;\s*(?:\n|$)/', implode("\n", $lines)) ?: [];
    return array_values(array_filter(array_map('trim', $parts), static fn ($s) => $s !== ''));
}

foreach ($pending as $name => [$file, $checksum]) {
    echo "\nApplying {$name} ...\n";
    try {
        foreach (statements((string) file_get_contents($file)) as $statement) {
            $pdo->exec($statement);
        }
        $insert = $pdo->prepare('INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)');
        $insert->execute([$name, $checksum]);
        echo "  done\n";
    } catch (Throwable $e) {
        fwrite(STDERR, "FAILED: {$name}: " . $e->getMessage() . "\n");
        fwrite(STDERR, "Fix the cause (partial changes from this file may exist) and re-run.\n");
        exit(1);
    }
}

echo "\nAll migrations applied.\n";
