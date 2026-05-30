import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay as dfnsIsSameDay,
} from 'date-fns';
import { nl } from 'date-fns/locale';

/** Sleutel voor een dag (yyyy-MM-dd) op basis van lokale tijd. */
export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parse(iso: string): Date {
  return parseISO(iso);
}

export function fmtMonthYear(date: Date): string {
  const s = format(date, 'LLLL yyyy', { locale: nl });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtDayLong(date: Date): string {
  const s = format(date, 'EEEE d MMMM yyyy', { locale: nl });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtTime(date: Date): string {
  return format(date, 'HH:mm', { locale: nl });
}

export function fmtTimeRange(start: Date, end: Date): string {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dfnsIsSameDay(a, b);
}

/** Weeknummer-onafhankelijke datum-only ISO (yyyy-MM-dd) → Date op middernacht lokaal. */
export function dateOnly(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Alle dagen van het maandraster (maandag-start), inclusief rand-dagen. */
export function monthGridDays(month: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export const WEEKDAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

/** Combineer een datum (Date) en een tijd-string (HH:mm) tot één Date. */
export function combineDateTime(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

/** Date → ISO-string die de lokale tijd behoudt (zonder Z). */
export function toLocalISO(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/** Date → tijd-input waarde (HH:mm). */
export function toTimeInput(date: Date): string {
  return format(date, 'HH:mm');
}
