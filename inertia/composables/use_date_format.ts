import { DateTime } from 'luxon'

export function useDateFormat() {
  function localDateTime(dateTime: string) {
    if (!dateTime) return ''
    let date = DateTime.fromISO(dateTime)
    return date.toLocaleString(DateTime.DATETIME_FULL)
  }

  return { localDateTime }
}
