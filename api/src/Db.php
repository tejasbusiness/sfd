<?php
declare(strict_types=1);

namespace Sfd;

final class Db
{
    private static ?\PDO $pdo = null;

    public static function pdo(): \PDO
    {
        if (self::$pdo === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                Env::require('DB_HOST'),
                (int) Env::get('DB_PORT', '3306'),
                Env::require('DB_NAME')
            );
            self::$pdo = new \PDO($dsn, Env::require('DB_USER'), Env::get('DB_PASSWORD', ''), [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            // All stored datetimes are UTC.
            self::$pdo->exec("SET time_zone = '+00:00'");
        }
        return self::$pdo;
    }

    /** @param list<mixed> $params */
    public static function run(string $sql, array $params = []): \PDOStatement
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function insertId(): int
    {
        return (int) self::pdo()->lastInsertId();
    }
}
