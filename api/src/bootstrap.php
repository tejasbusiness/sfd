<?php
declare(strict_types=1);

$vendor = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($vendor)) {
    require $vendor;
}

spl_autoload_register(static function (string $class): void {
    if (str_starts_with($class, 'Sfd\\')) {
        $file = __DIR__ . '/' . substr($class, 4) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});
