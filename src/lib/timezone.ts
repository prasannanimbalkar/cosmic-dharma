import { DateTime } from 'luxon'

/** UTC offset in hours for local birth time in an IANA timezone (includes DST). */
export function timezoneOffsetHours(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: timeZone })
  if (!dt.isValid) return 0
  return dt.offset / 60
}
