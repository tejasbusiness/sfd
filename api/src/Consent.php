<?php
declare(strict_types=1);

namespace Sfd;

/** Writes the proof-of-consent row (docs/14). Bump WORDING_VERSION when any consent wording changes. */
final class Consent
{
    public const WORDING_VERSION = '2026-09-20';

    public static function record(string $purpose, ?string $email, ?string $sourcePage, ?bool $analytics = null, ?bool $marketing = null, bool $granted = true): int
    {
        Db::run(
            'INSERT INTO consents (purpose, granted, analytics, marketing, wording_version, subject_email, ip_hash, user_agent, source_page, is_test)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $purpose,
                (int) $granted,
                $analytics === null ? null : (int) $analytics,
                $marketing === null ? null : (int) $marketing,
                self::WORDING_VERSION,
                $email,
                Http::ipHash(),
                Http::userAgent(),
                $sourcePage,
                Env::isLocal() ? 1 : 0,
            ]
        );
        return Db::insertId();
    }
}
