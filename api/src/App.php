<?php
declare(strict_types=1);

namespace Sfd;

/**
 * Router and endpoint handlers. Endpoints (all JSON, all under /api):
 *   GET  /availability?timezone=Area/City
 *   POST /bookings          (Idempotency-Key header)
 *   POST /contact
 *   POST /preview-applications
 *   POST /playbook
 *   POST /consent           (cookie-banner choice)
 */
final class App
{
    private const RESPONSE_TIME = 'We reply to every enquiry within 1 business day.';

    public static function run(string $root): void
    {
        ini_set('display_errors', '0');
        try {
            Env::load(getenv('SFD_ENV_FILE') ?: $root . '/.env');
            Http::checkOrigin();

            $path = rtrim((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
            $path = preg_replace('#^/api#', '', $path) ?? '';
            $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

            match (true) {
                $method === 'GET' && $path === '/availability' => self::availability(),
                $method === 'POST' && $path === '/bookings' => self::booking(),
                $method === 'POST' && $path === '/contact' => self::contact(),
                $method === 'POST' && $path === '/preview-applications' => self::previewApplication(),
                $method === 'POST' && $path === '/playbook' => self::playbook(),
                $method === 'POST' && $path === '/consent' => self::cookieConsent(),
                default => Http::json(404, ['ok' => false, 'error' => 'not_found']),
            };
        } catch (\Throwable $e) {
            error_log('SFD API error: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
            Http::json(500, ['ok' => false, 'error' => 'server_error']);
        }
    }

    // ---------------------------------------------------------------- availability

    private static function availability(): never
    {
        RateLimit::hit('availability');
        $settings = Availability::settings();
        $tzName = $_GET['timezone'] ?? $settings['sfd_timezone'];
        try {
            $tz = new \DateTimeZone(is_string($tzName) ? $tzName : $settings['sfd_timezone']);
        } catch (\Throwable) {
            $tz = new \DateTimeZone($settings['sfd_timezone']);
        }

        $days = [];
        foreach (Availability::slots($tz) as [$start]) {
            $local = $start->setTimezone($tz);
            $days[$local->format('Y-m-d')][] = ['time' => $local->format('H:i'), 'start' => $start->format('Y-m-d\TH:i:s\Z')];
        }
        $out = [];
        foreach ($days as $date => $times) {
            $out[] = ['date' => $date, 'times' => $times];
        }
        Http::json(200, ['ok' => true, 'timezone' => $tz->getName(), 'durationMinutes' => (int) $settings['call_duration_minutes'], 'slots' => $out]);
    }

    // ---------------------------------------------------------------- bookings

    private static function booking(): never
    {
        RateLimit::hit('booking');
        $in = Http::body();
        self::honeypot($in);

        $key = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '';
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $key)) {
            Http::json(400, ['ok' => false, 'error' => 'invalid_idempotency_key']);
        }

        $existing = Db::run('SELECT * FROM bookings WHERE idempotency_key = ?', [$key])->fetch();
        if ($existing) {
            Http::json(200, self::bookingResult($existing));
        }

        $v = (new Validator($in))
            ->text('fullName', 'Full name', 120)->email()->phone()
            ->text('businessName', 'Business name', 160)->website('website')
            ->text('country', 'Country', 80, false)->text('message', 'Message', 2000)->consent();

        $tzName = is_string($in['timezone'] ?? null) ? $in['timezone'] : '';
        try {
            $visitorTz = new \DateTimeZone($tzName);
        } catch (\Throwable) {
            $visitorTz = null;
            $v->errors['timezone'] = 'Choose a valid timezone.';
        }

        $start = null;
        try {
            $start = new \DateTimeImmutable((string) ($in['start'] ?? ''), new \DateTimeZone('UTC'));
            $start = $start->setTimezone(new \DateTimeZone('UTC'));
        } catch (\Throwable) {
            $v->errors['start'] = 'Choose a time.';
        }

        if (!$v->ok() || $start === null || $visitorTz === null) {
            Http::json(422, ['ok' => false, 'error' => 'validation', 'errors' => $v->errors]);
        }

        // Recheck: the requested start must still be an open slot right now.
        $end = null;
        foreach (Availability::slots($visitorTz) as [$slotStart, $slotEnd]) {
            if ($slotStart == $start) {
                $end = $slotEnd;
                break;
            }
        }
        if ($end === null) {
            Http::json(409, ['ok' => false, 'reason' => 'slot_unavailable']);
        }

        RateLimit::hit('booking_saved');

        $c = $v->clean;
        $t = Validator::tracking($in);
        $consentId = Consent::record('booking', $c['email'], $t['source_page']);
        $reference = 'BK-' . strtoupper(bin2hex(random_bytes(4)));
        $settings = Availability::settings();

        try {
            Db::run(
                'INSERT INTO bookings (reference, idempotency_key, slot_start_utc, slot_end_utc, visitor_timezone, sfd_timezone,
                    full_name, email, country_code, mobile_number, business_name, website, country, message, consent_id, source_page,
                    utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_hash, user_agent, is_test)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [
                    $reference, $key, $start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s'), $visitorTz->getName(), $settings['sfd_timezone'],
                    $c['fullName'], $c['email'], $c['countryCode'], $c['mobileNumber'], $c['businessName'], $c['website'], $c['country'], $c['message'],
                    $consentId, $t['source_page'], $t['utm_source'], $t['utm_medium'], $t['utm_campaign'], $t['utm_term'], $t['utm_content'],
                    Http::ipHash(), Http::userAgent(), Env::isLocal() ? 1 : 0,
                ]
            );
        } catch (\PDOException $e) {
            // The unique slot key is the final guard against two people taking the same time.
            if (($e->errorInfo[1] ?? 0) === 1062) {
                $again = Db::run('SELECT * FROM bookings WHERE idempotency_key = ?', [$key])->fetch();
                if ($again) {
                    Http::json(200, self::bookingResult($again));
                }
                Http::json(409, ['ok' => false, 'reason' => 'slot_unavailable']);
            }
            throw $e;
        }
        $id = Db::insertId();

        $meetUrl = null;
        $calendarNote = 'Google Calendar is not connected yet: add this call to the calendar manually and send the visitor a Meet link.';
        if (Google::enabled()) {
            try {
                $event = Google::createEvent(
                    ['full_name' => $c['fullName'], 'email' => $c['email'], 'country_code' => $c['countryCode'], 'mobile_number' => $c['mobileNumber'],
                     'business_name' => $c['businessName'], 'website' => $c['website'], 'message' => $c['message']],
                    $start, $end, $key
                );
                $meetUrl = $event['meetUrl'];
                Db::run("UPDATE bookings SET status = 'confirmed', google_event_id = ?, meet_url = ?, calendar_synced_at = UTC_TIMESTAMP() WHERE id = ?", [$event['id'], $meetUrl, $id]);
                $calendarNote = 'Calendar event created' . ($meetUrl ? ' with a Meet link.' : ' (no Meet link returned).');
            } catch (\Throwable $e) {
                error_log('Booking calendar sync failed: ' . $e->getMessage());
                $calendarNote = 'The calendar event could NOT be created (see server log). Add it manually.';
            }
        }

        $when = $start->setTimezone($visitorTz)->format('l j F Y, H:i') . ' (' . $visitorTz->getName() . ')';
        $whenSfd = $start->setTimezone(new \DateTimeZone($settings['sfd_timezone']))->format('l j F Y, H:i') . ' (' . $settings['sfd_timezone'] . ')';

        Mailer::send('booking_owner', Env::require('MAIL_OWNER_TO'), null, "New discovery call booked: {$c['fullName']}", 'A visitor booked a discovery call.', [
            'Reference' => $reference, 'When (visitor)' => $when, 'When (SFD)' => $whenSfd, 'Name' => $c['fullName'], 'Email' => $c['email'],
            'Phone' => $c['countryCode'] . ' ' . $c['mobileNumber'], 'Business' => (string) $c['businessName'], 'Website' => (string) $c['website'],
            'Country' => (string) $c['country'], 'Message' => $c['message'], 'Calendar' => $calendarNote . ($meetUrl ? " {$meetUrl}" : ''),
        ], 'booking', $id, $c['email']);

        Mailer::send('booking_visitor', $c['email'], $c['fullName'], 'Your discovery call with SynergyFirst Digital', "Hi {$c['fullName']}, your call is booked.", [
            'Reference' => $reference, 'When' => $when,
            'Meeting link' => $meetUrl ?? 'We will email your Google Meet link before the call.',
        ], 'booking', $id);

        $row = Db::run('SELECT * FROM bookings WHERE id = ?', [$id])->fetch();
        Http::json(201, self::bookingResult($row));
    }

    /** @param array<string,mixed> $row */
    private static function bookingResult(array $row): array
    {
        return [
            'ok' => true,
            'reference' => $row['reference'],
            'status' => $row['status'],
            'meetUrl' => $row['meet_url'],
            'confirmedStart' => (new \DateTimeImmutable($row['slot_start_utc'], new \DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z'),
        ];
    }

    // ---------------------------------------------------------------- contact

    private static function contact(): never
    {
        RateLimit::hit('contact');
        $in = Http::body();
        self::honeypot($in);

        $v = (new Validator($in))
            ->text('fullName', 'Full name', 120)->email()->phone()
            ->text('businessName', 'Business name', 160, false)->website('website')
            ->text('topic', 'Topic', 60)->text('source', 'This', 60, false)->text('sourceOther', 'This', 160, false)
            ->text('message', 'Message', 5000)->consent();
        if (($v->clean['source'] ?? '') === 'other' && ($v->clean['sourceOther'] ?? null) === null) {
            $v->errors['sourceOther'] = 'Please tell us where you heard about us.';
        }
        self::failIfInvalid($v);
        RateLimit::hit('contact_saved');

        $c = $v->clean;
        $t = Validator::tracking($in);
        $consentId = Consent::record('contact', $c['email'], $t['source_page']);
        $reference = 'EN-' . strtoupper(bin2hex(random_bytes(4)));
        Db::run(
            'INSERT INTO contact_enquiries (reference, full_name, email, country_code, mobile_number, business_name, website, topic, source, source_other,
                message, consent_id, source_page, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_hash, user_agent, is_test)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [$reference, $c['fullName'], $c['email'], $c['countryCode'], $c['mobileNumber'], $c['businessName'], $c['website'], $c['topic'], $c['source'],
             $c['sourceOther'], $c['message'], $consentId, $t['source_page'], $t['utm_source'], $t['utm_medium'], $t['utm_campaign'], $t['utm_term'],
             $t['utm_content'], Http::ipHash(), Http::userAgent(), Env::isLocal() ? 1 : 0]
        );
        $id = Db::insertId();

        Mailer::send('contact_owner', Env::require('MAIL_OWNER_TO'), null, "New enquiry: {$c['fullName']}", 'A visitor sent a message through the contact form.', [
            'Reference' => $reference, 'Name' => $c['fullName'], 'Email' => $c['email'], 'Phone' => $c['countryCode'] . ' ' . $c['mobileNumber'],
            'Business' => (string) $c['businessName'], 'Website' => (string) $c['website'], 'Topic' => $c['topic'],
            'Heard about us' => (string) $c['source'] . ($c['sourceOther'] ? ' (' . $c['sourceOther'] . ')' : ''), 'Message' => $c['message'],
            'Page' => (string) $t['source_page'], 'Campaign' => (string) $t['utm_campaign'],
        ], 'contact', $id, $c['email']);
        Mailer::send('contact_visitor', $c['email'], $c['fullName'], 'We received your message', "Hi {$c['fullName']}, thank you for contacting SynergyFirst Digital. " . self::RESPONSE_TIME, [
            'Reference' => $reference,
        ], 'contact', $id);

        Http::json(201, ['ok' => true, 'reference' => $reference]);
    }

    // ---------------------------------------------------------------- free preview

    private static function previewApplication(): never
    {
        RateLimit::hit('preview');
        $in = Http::body();
        self::honeypot($in);

        $v = (new Validator($in))
            ->text('fullName', 'Full name', 120)->email()->phone()
            ->text('businessName', 'Business name', 160)->website('website')->website('gbpUrl', 500)
            ->text('country', 'Country', 80)->text('city', 'City', 120)->text('category', 'Category', 80)
            ->text('primaryService', 'Primary service', 200)->text('problem', 'This', 5000)->consent();
        self::failIfInvalid($v);
        RateLimit::hit('preview_saved');

        $c = $v->clean;
        $t = Validator::tracking($in);
        $consentId = Consent::record('preview', $c['email'], $t['source_page']);
        $reference = 'PV-' . strtoupper(bin2hex(random_bytes(4)));
        Db::run(
            'INSERT INTO preview_applications (reference, full_name, email, country_code, mobile_number, business_name, website, gbp_url, country, city,
                category, primary_service, problem, consent_id, source_page, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_hash, user_agent, is_test)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [$reference, $c['fullName'], $c['email'], $c['countryCode'], $c['mobileNumber'], $c['businessName'], $c['website'], $c['gbpUrl'], $c['country'],
             $c['city'], $c['category'], $c['primaryService'], $c['problem'], $consentId, $t['source_page'], $t['utm_source'], $t['utm_medium'],
             $t['utm_campaign'], $t['utm_term'], $t['utm_content'], Http::ipHash(), Http::userAgent(), Env::isLocal() ? 1 : 0]
        );
        $id = Db::insertId();

        Mailer::send('preview_owner', Env::require('MAIL_OWNER_TO'), null, "New Free Preview application: {$c['businessName']}", 'A business applied for a Free Preview Website.', [
            'Reference' => $reference, 'Name' => $c['fullName'], 'Email' => $c['email'], 'Phone' => $c['countryCode'] . ' ' . $c['mobileNumber'],
            'Business' => $c['businessName'], 'Website' => (string) $c['website'], 'Google Business Profile' => (string) $c['gbpUrl'],
            'Location' => $c['city'] . ', ' . $c['country'], 'Category' => $c['category'], 'Primary service' => $c['primaryService'], 'Main problem' => $c['problem'],
        ], 'preview', $id, $c['email']);
        Mailer::send('preview_visitor', $c['email'], $c['fullName'], 'We received your Free Preview application', "Hi {$c['fullName']}, thank you for applying. We will review your details and email you at this address. " . self::RESPONSE_TIME, [
            'Reference' => $reference, 'Business' => $c['businessName'],
        ], 'preview', $id);

        Http::json(201, ['ok' => true, 'reference' => $reference]);
    }

    // ---------------------------------------------------------------- playbook

    private static function playbook(): never
    {
        RateLimit::hit('playbook');
        $in = Http::body();
        self::honeypot($in);

        $v = (new Validator($in))->text('fullName', 'Full name', 120)->email()->consent();
        self::failIfInvalid($v);
        RateLimit::hit('playbook_saved');

        $c = $v->clean;
        $t = Validator::tracking($in);
        $consentId = Consent::record('playbook', $c['email'], $t['source_page']);
        // Same response whether or not the address is already on the list (no enumeration).
        Db::run(
            "INSERT INTO playbook_subscribers (full_name, email, consent_id, status, unsubscribe_token, source_page, ip_hash, is_test)
             VALUES (?, ?, ?, 'subscribed', ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), consent_id = VALUES(consent_id), status = 'subscribed', unsubscribed_at = NULL",
            [$c['fullName'], $c['email'], $consentId, bin2hex(random_bytes(32)), $t['source_page'], Http::ipHash(), Env::isLocal() ? 1 : 0]
        );

        Mailer::send('playbook_owner', Env::require('MAIL_OWNER_TO'), null, "New playbook sign-up: {$c['fullName']}", 'Someone asked for the AI Prompts Playbook. Send it to them manually until delivery is automated.', [
            'Name' => $c['fullName'], 'Email' => $c['email'],
        ], 'playbook', null, $c['email']);

        Http::json(201, ['ok' => true]);
    }

    // ---------------------------------------------------------------- cookie consent

    private static function cookieConsent(): never
    {
        RateLimit::hit('consent');
        $in = Http::body();
        $analytics = ($in['analytics'] ?? false) === true;
        $marketing = ($in['marketing'] ?? false) === true;
        $t = Validator::tracking($in);
        Consent::record('cookie', null, $t['source_page'], $analytics, $marketing, $analytics || $marketing);
        Http::json(201, ['ok' => true]);
    }

    // ---------------------------------------------------------------- helpers

    /** Bots that fill the hidden field get a fake success and nothing is stored. */
    private static function honeypot(array $in): void
    {
        if (isset($in['hp']) && $in['hp'] !== '') {
            Http::json(201, ['ok' => true]);
        }
    }

    private static function failIfInvalid(Validator $v): void
    {
        if (!$v->ok()) {
            Http::json(422, ['ok' => false, 'error' => 'validation', 'errors' => $v->errors]);
        }
    }
}
