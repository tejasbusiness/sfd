<?php
declare(strict_types=1);

namespace Sfd;

/**
 * Minimal Google Calendar client (OAuth refresh token + cURL, no SDK).
 * Only active when GOOGLE_ENABLED=1; credentials come from the environment file and
 * never reach the browser (CLAUDE.md rule 11).
 */
final class Google
{
    private static ?string $token = null;

    public static function enabled(): bool
    {
        return Env::get('GOOGLE_ENABLED', '0') === '1';
    }

    /** @return list<array{0:\DateTimeImmutable,1:\DateTimeImmutable}> busy periods in UTC */
    public static function busy(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $calendar = Env::require('GOOGLE_CALENDAR_ID');
        $data = self::request('POST', 'https://www.googleapis.com/calendar/v3/freeBusy', [
            'timeMin' => $from->format('Y-m-d\TH:i:s\Z'),
            'timeMax' => $to->format('Y-m-d\TH:i:s\Z'),
            'items' => [['id' => $calendar]],
        ]);
        $utc = new \DateTimeZone('UTC');
        $out = [];
        foreach ($data['calendars'][$calendar]['busy'] ?? [] as $period) {
            $out[] = [new \DateTimeImmutable($period['start'], $utc), new \DateTimeImmutable($period['end'], $utc)];
        }
        return $out;
    }

    /**
     * Creates the event with a Google Meet link and lets Google email the invite.
     * @param array<string,mixed> $b booking fields
     * @return array{id:string,meetUrl:?string}
     */
    public static function createEvent(array $b, \DateTimeImmutable $start, \DateTimeImmutable $end, string $requestId): array
    {
        $calendar = rawurlencode(Env::require('GOOGLE_CALENDAR_ID'));
        $description = "Booked through synergyfirstdigital.com\n\n"
            . 'Name: ' . $b['full_name'] . "\n"
            . 'Email: ' . $b['email'] . "\n"
            . 'Phone: ' . $b['country_code'] . ' ' . $b['mobile_number'] . "\n"
            . 'Business: ' . ($b['business_name'] ?? '') . "\n"
            . 'Website: ' . ($b['website'] ?? '') . "\n\n"
            . 'Message: ' . $b['message'];

        $data = self::request(
            'POST',
            "https://www.googleapis.com/calendar/v3/calendars/{$calendar}/events?conferenceDataVersion=1&sendUpdates=all",
            [
                'summary' => 'SFD discovery call: ' . ($b['business_name'] ?: $b['full_name']),
                'description' => $description,
                'start' => ['dateTime' => $start->format('Y-m-d\TH:i:s\Z'), 'timeZone' => 'UTC'],
                'end' => ['dateTime' => $end->format('Y-m-d\TH:i:s\Z'), 'timeZone' => 'UTC'],
                'attendees' => [['email' => $b['email'], 'displayName' => $b['full_name']]],
                'conferenceData' => [
                    'createRequest' => [
                        'requestId' => $requestId,
                        'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                    ],
                ],
            ]
        );

        $meet = $data['hangoutLink'] ?? null;
        foreach ($data['conferenceData']['entryPoints'] ?? [] as $entry) {
            if (($entry['entryPointType'] ?? '') === 'video' && !empty($entry['uri'])) {
                $meet = $entry['uri'];
            }
        }
        return ['id' => (string) $data['id'], 'meetUrl' => $meet];
    }

    private static function accessToken(): string
    {
        if (self::$token !== null) {
            return self::$token;
        }
        $data = self::http('POST', 'https://oauth2.googleapis.com/token', http_build_query([
            'client_id' => Env::require('GOOGLE_OAUTH_CLIENT_ID'),
            'client_secret' => Env::require('GOOGLE_OAUTH_CLIENT_SECRET'),
            'refresh_token' => Env::require('GOOGLE_OAUTH_REFRESH_TOKEN'),
            'grant_type' => 'refresh_token',
        ]), ['Content-Type: application/x-www-form-urlencoded']);
        self::$token = (string) ($data['access_token'] ?? '');
        if (self::$token === '') {
            throw new \RuntimeException('Google token response had no access_token');
        }
        return self::$token;
    }

    /** @return array<string,mixed> */
    private static function request(string $method, string $url, array $body): array
    {
        return self::http($method, $url, json_encode($body, JSON_UNESCAPED_SLASHES), [
            'Authorization: Bearer ' . self::accessToken(),
            'Content-Type: application/json',
        ]);
    }

    /** @param list<string> $headers @return array<string,mixed> */
    private static function http(string $method, string $url, string $body, array $headers): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new \RuntimeException("Google request failed: {$error}");
        }
        $data = json_decode((string) $raw, true);
        if ($status >= 400 || !is_array($data)) {
            throw new \RuntimeException("Google API error {$status}: " . mb_substr((string) $raw, 0, 300));
        }
        return $data;
    }
}
