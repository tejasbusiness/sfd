<?php
declare(strict_types=1);

namespace Sfd;

/**
 * Computes bookable call slots from the MySQL rules (booking_settings,
 * availability_rules, availability_exceptions), existing bookings and, when
 * enabled, the Google Calendar free/busy data. All datetimes are UTC.
 *
 * Opening hours are in the VISITOR'S local time (owner decision, 2026-09-20): a
 * visitor sees the windows on their own clock, so the slots depend on their timezone.
 * The daily booking limit is still counted per day in booking_settings.sfd_timezone.
 */
final class Availability
{
    /** Statuses that hold a slot. */
    private const ACTIVE = "('pending_calendar','confirmed')";

    /** @return array<string,string> */
    public static function settings(): array
    {
        $out = [];
        foreach (Db::run('SELECT setting_key, setting_value FROM booking_settings')->fetchAll() as $row) {
            $out[$row['setting_key']] = $row['setting_value'];
        }
        return $out;
    }

    /** @return list<array{0:\DateTimeImmutable,1:\DateTimeImmutable}> [start, end] pairs, sorted */
    public static function slots(\DateTimeZone $visitorTz): array
    {
        $s = self::settings();
        $sfdTz = new \DateTimeZone($s['sfd_timezone']);
        $utc = new \DateTimeZone('UTC');
        $duration = (int) $s['call_duration_minutes'];
        $buffer = (int) $s['buffer_minutes'];
        $step = max(5, (int) $s['slot_step_minutes']);
        $dailyLimit = (int) $s['daily_booking_limit'];

        $now = new \DateTimeImmutable('now', $utc);
        $earliest = $now->modify('+' . (int) $s['min_notice_hours'] . ' hours');
        $latest = $now->modify('+' . (int) $s['booking_window_days'] . ' days');

        $rules = [];
        foreach (Db::run('SELECT weekday, start_time, end_time FROM availability_rules WHERE active = 1')->fetchAll() as $r) {
            $rules[(int) $r['weekday']][] = $r;
        }
        $exceptions = [];
        foreach (Db::run('SELECT on_date, start_time, end_time FROM availability_exceptions WHERE on_date >= ?', [$now->format('Y-m-d')])->fetchAll() as $x) {
            $exceptions[$x['on_date']][] = $x;
        }

        $booked = Db::run(
            'SELECT slot_start_utc, slot_end_utc FROM bookings WHERE slot_lock = 1 AND status IN ' . self::ACTIVE . ' AND slot_start_utc < ? AND slot_end_utc > ?',
            [$latest->modify("+{$buffer} minutes")->format('Y-m-d H:i:s'), $earliest->modify("-{$buffer} minutes")->format('Y-m-d H:i:s')]
        )->fetchAll();
        $bookedRanges = [];
        $bookedPerDay = [];
        foreach ($booked as $b) {
            $bs = new \DateTimeImmutable($b['slot_start_utc'], $utc);
            $bookedRanges[] = [$bs, new \DateTimeImmutable($b['slot_end_utc'], $utc)];
            $day = $bs->setTimezone($sfdTz)->format('Y-m-d');
            $bookedPerDay[$day] = ($bookedPerDay[$day] ?? 0) + 1;
        }

        $busy = [];
        if (Google::enabled()) {
            try {
                $busy = Google::busy($earliest, $latest);
            } catch (\Throwable $e) {
                // Fail open: bookings are still checked against MySQL, and the owner is
                // told when the calendar event could not be created.
                error_log('Availability: Google free/busy failed: ' . $e->getMessage());
            }
        }

        $slots = [];
        $day = $now->setTimezone($visitorTz)->setTime(0, 0);
        $lastDay = $latest->setTimezone($visitorTz)->setTime(0, 0);
        for (; $day <= $lastDay; $day = $day->modify('+1 day')) {
            $date = $day->format('Y-m-d');

            foreach ($rules[(int) $day->format('N')] ?? [] as $rule) {
                [$sh, $sm] = array_map('intval', explode(':', $rule['start_time']));
                [$eh, $em] = array_map('intval', explode(':', $rule['end_time']));
                $cursor = $day->setTime($sh, $sm);
                $close = $day->setTime($eh, $em);

                for (; $cursor->modify("+{$duration} minutes") <= $close; $cursor = $cursor->modify("+{$step} minutes")) {
                    $start = $cursor->setTimezone($utc);
                    $end = $start->modify("+{$duration} minutes");
                    if ($start < $earliest || $start > $latest) {
                        continue;
                    }
                    if (self::blockedByException($exceptions[$date] ?? [], $cursor, $cursor->modify("+{$duration} minutes"), $day)) {
                        continue;
                    }
                    if (self::overlaps($start, $end, $bookedRanges, $buffer) || self::overlaps($start, $end, $busy, $buffer)) {
                        continue;
                    }
                    $sfdDay = $start->setTimezone($sfdTz)->format('Y-m-d');
                    if ($dailyLimit > 0 && ($bookedPerDay[$sfdDay] ?? 0) >= $dailyLimit) {
                        continue;
                    }
                    $slots[] = [$start, $end];
                }
            }
        }
        usort($slots, static fn ($a, $b) => $a[0] <=> $b[0]);
        return $slots;
    }

    /** @param list<array<string,mixed>> $exceptions */
    private static function blockedByException(array $exceptions, \DateTimeImmutable $start, \DateTimeImmutable $end, \DateTimeImmutable $day): bool
    {
        foreach ($exceptions as $x) {
            if ($x['start_time'] === null || $x['end_time'] === null) {
                return true;
            }
            [$sh, $sm] = array_map('intval', explode(':', $x['start_time']));
            [$eh, $em] = array_map('intval', explode(':', $x['end_time']));
            if ($start < $day->setTime($eh, $em) && $end > $day->setTime($sh, $sm)) {
                return true;
            }
        }
        return false;
    }

    /** A slot conflicts if it comes within $buffer minutes after an existing range, or overlaps it. */
    private static function overlaps(\DateTimeImmutable $start, \DateTimeImmutable $end, array $ranges, int $buffer): bool
    {
        foreach ($ranges as [$rs, $re]) {
            if ($start < $re->modify("+{$buffer} minutes") && $end->modify("+{$buffer} minutes") > $rs) {
                return true;
            }
        }
        return false;
    }
}
