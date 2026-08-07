import { DayPicker } from 'react-day-picker'

interface BookingCalendarProps {
  selected: Date | undefined
  onSelect: (date: Date) => void
  maxDaysAhead?: number
  /** Dates without any open slot are disabled too, not just past/out-of-window ones. */
  dayHasAvailability?: (date: Date) => boolean
}

/**
 * Step 1 of the booking wizard. Only today through `maxDaysAhead` days out
 * are selectable — react-day-picker's `disabled` matcher handles both the
 * past-dates cutoff and the future window in one pass.
 *
 * Slots are generated/stored in UTC (lib/booking/availability.ts) by walking
 * UTC calendar days, so the calendar is pinned to UTC via the `timeZone`
 * prop to keep "today"/"day N"/disabled-day checks in the same calendar-day
 * frame as the slot data. Displayed times are IST (see BookingWidget's
 * formatTimeLabel), but IST business hours (9am-5pm) never cross a UTC
 * midnight boundary, so the UTC-anchored calendar date and the IST date
 * visitors see always agree — no separate IST-anchoring needed here.
 */
function BookingCalendar({ selected, onSelect, maxDaysAhead = 15, dayHasAvailability }: BookingCalendarProps) {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  const maxDate = new Date(today)
  maxDate.setUTCDate(maxDate.getUTCDate() + maxDaysAhead)

  return (
    <DayPicker
      mode="single"
      timeZone="UTC"
      selected={selected}
      onSelect={(date) => date && onSelect(date)}
      disabled={[
        { before: today },
        { after: maxDate },
        ...(dayHasAvailability ? [(date: Date) => !dayHasAvailability(date)] : []),
      ]}
      startMonth={today}
      endMonth={maxDate}
      className="sfd-calendar"
      classNames={{
        root: 'font-sans',
        months: 'flex flex-col',
        month_caption: 'flex items-center justify-center pb-1.5',
        caption_label: 'font-display text-base text-ink',
        nav: 'flex items-center justify-between',
        button_previous:
          'inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sage hover:text-ink disabled:opacity-30 disabled:pointer-events-none',
        button_next:
          'inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sage hover:text-ink disabled:opacity-30 disabled:pointer-events-none',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex w-full',
        weekday: 'font-mono-label flex-1 pb-1 text-center text-[9px] uppercase text-ink-soft',
        week: 'flex w-full',
        day: 'aspect-square flex-1 p-0.5',
        day_button:
          'flex h-full w-full items-center justify-center rounded-full text-xs text-ink transition-colors hover:bg-sage disabled:text-ink-soft/30 disabled:hover:bg-transparent sm:text-sm',
        selected: '[&>button]:bg-ink [&>button]:text-cream [&>button]:hover:bg-teal-dark',
        today: '[&>button]:font-semibold [&>button]:text-teal',
        outside: 'invisible',
      }}
    />
  )
}

export default BookingCalendar
