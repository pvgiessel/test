import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInMilliseconds,
  startOfWeek,
  isAfter,
} from 'date-fns';
import type { Appointment, EventOverride, Occurrence, RecurrenceRule } from '../types/models';
import { parse, dateOnly, toLocalISO } from './date';

const MAX_OCCURRENCES = 1000;

/**
 * Genereer de begin-datums van een reeks vanaf dtstart, tot en met `windowEnd`
 * (of tot count/until is bereikt). Werkt volledig met lokale tijd.
 */
function generateStarts(rule: RecurrenceRule, dtstart: Date, windowEnd: Date): Date[] {
  const interval = Math.max(1, rule.interval || 1);
  const until = rule.until ? endOfDay(dateOnly(rule.until)) : null;
  const maxCount = rule.count && rule.count > 0 ? rule.count : MAX_OCCURRENCES;
  const result: Date[] = [];

  const pushIfValid = (d: Date): boolean => {
    if (until && isAfter(d, until)) return false;
    result.push(d);
    return result.length < maxCount;
  };

  if (rule.freq === 'WEEKLY' && rule.byweekday && rule.byweekday.length > 0) {
    const weekdays = [...rule.byweekday].sort((a, b) => a - b);
    // Begin bij de maandag van de week van dtstart.
    let weekStart = startOfWeek(dtstart, { weekStartsOn: 1 });
    let guard = 0;
    outer: while (guard++ < MAX_OCCURRENCES) {
      for (const wd of weekdays) {
        const occ = setTime(addDays(weekStart, wd - 1), dtstart);
        if (occ < dtstart) continue; // sla momenten vóór de start over
        if (occ > windowEnd && (!until || occ > until)) break outer;
        if (occ <= windowEnd || (until && occ <= until)) {
          if (!pushIfValid(occ)) break outer;
        } else {
          break outer;
        }
      }
      weekStart = addWeeks(weekStart, interval);
    }
    return result.sort((a, b) => a.getTime() - b.getTime());
  }

  // DAILY / WEEKLY (zonder weekdagen) / MONTHLY / YEARLY
  let cur = dtstart;
  let guard = 0;
  while (guard++ < MAX_OCCURRENCES) {
    if (cur > windowEnd && (!until || cur > until)) break;
    if (!pushIfValid(cur)) break;
    cur = step(cur, rule.freq, interval);
  }
  return result;
}

function step(d: Date, freq: RecurrenceRule['freq'], interval: number): Date {
  switch (freq) {
    case 'DAILY':
      return addDays(d, interval);
    case 'WEEKLY':
      return addWeeks(d, interval);
    case 'MONTHLY':
      return addMonths(d, interval);
    case 'YEARLY':
      return addYears(d, interval);
  }
}

function setTime(date: Date, timeSource: Date): Date {
  const d = new Date(date);
  d.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  return d;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Reken de concrete afspraken (occurrences) van een afspraak uit binnen
 * [rangeStart, rangeEnd]. Past afwijkingen (overrides) en verwijderingen toe.
 */
export function expandOccurrences(
  appt: Appointment,
  rangeStart: Date,
  rangeEnd: Date,
): Occurrence[] {
  const start = parse(appt.start);
  const end = parse(appt.end);
  const duration = Math.max(0, differenceInMilliseconds(end, start));
  const overrides = appt.overrides ?? {};

  const buildOccurrence = (originalStart: Date): Occurrence | null => {
    const key = toLocalISO(originalStart);
    const ov: EventOverride | undefined = overrides[key];
    if (ov?.deleted) return null;

    const effStart = ov?.start ? parse(ov.start) : originalStart;
    const effEnd = ov?.end
      ? parse(ov.end)
      : new Date(effStart.getTime() + duration);

    return {
      appointmentId: appt.id,
      occurrenceKey: key,
      isRecurring: !!appt.recurrence,
      isException: !!ov,
      title: ov?.title ?? appt.title,
      description: ov?.description ?? appt.description,
      locationId: ov?.locationId !== undefined ? ov.locationId : appt.locationId,
      start: effStart,
      end: effEnd,
      allDay: ov?.allDay ?? appt.allDay,
      userIds: ov?.userIds ?? appt.userIds,
    };
  };

  const inRange = (o: Occurrence) => o.start <= rangeEnd && o.end >= rangeStart;

  if (!appt.recurrence) {
    const occ = buildOccurrence(start);
    return occ && inRange(occ) ? [occ] : [];
  }

  // Iets ruimer genereren zodat verplaatste afspraken aan de rand meekomen.
  const windowEnd = addDays(rangeEnd, 1);
  const starts = generateStarts(appt.recurrence, start, windowEnd);
  const result: Occurrence[] = [];
  for (const s of starts) {
    const occ = buildOccurrence(s);
    if (occ && inRange(occ)) result.push(occ);
  }
  return result;
}

/** Korte, leesbare omschrijving van een herhalingsregel (NL). */
export function describeRecurrence(rule: RecurrenceRule | null | undefined): string {
  if (!rule) return 'Eenmalig';
  const n = Math.max(1, rule.interval || 1);
  const unit: Record<RecurrenceRule['freq'], [string, string]> = {
    DAILY: ['dag', 'dagen'],
    WEEKLY: ['week', 'weken'],
    MONTHLY: ['maand', 'maanden'],
    YEARLY: ['jaar', 'jaar'],
  };
  const [sing, plur] = unit[rule.freq];
  let base = n === 1 ? `Elke ${sing}` : `Elke ${n} ${plur}`;
  if (rule.freq === 'WEEKLY' && rule.byweekday?.length) {
    const labels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
    const days = [...rule.byweekday].sort((a, b) => a - b).map((d) => labels[d - 1]);
    base += ` op ${days.join(', ')}`;
  }
  if (rule.count) base += `, ${rule.count}×`;
  else if (rule.until) base += `, t/m ${rule.until}`;
  return base;
}
