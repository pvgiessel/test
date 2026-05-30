import type { Appointment, Occurrence, Task } from '../types/models';
import { expandOccurrences } from './recurrence';
import { dayKey } from './date';

export interface DayItems {
  occurrences: Occurrence[];
  tasks: Task[];
}

function matchesFilter(userIds: string[], filter: string[]): boolean {
  if (filter.length === 0) return true;
  return userIds.some((id) => filter.includes(id));
}

/**
 * Bouw een map dag -> { afspraken, taken } voor het zichtbare bereik,
 * gefilterd op gekozen gebruikers (lege filter = iedereen).
 */
export function buildDayItems(
  appointments: Appointment[],
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date,
  filter: string[],
): Map<string, DayItems> {
  const map = new Map<string, DayItems>();
  const get = (key: string): DayItems => {
    let v = map.get(key);
    if (!v) {
      v = { occurrences: [], tasks: [] };
      map.set(key, v);
    }
    return v;
  };

  for (const appt of appointments) {
    const occs = expandOccurrences(appt, rangeStart, rangeEnd);
    for (const occ of occs) {
      if (!matchesFilter(occ.userIds, filter)) continue;
      get(dayKey(occ.start)).occurrences.push(occ);
    }
  }

  for (const task of tasks) {
    if (!task.date) continue;
    if (!matchesFilter(task.userIds, filter)) continue;
    get(task.date).tasks.push(task);
  }

  // sorteer afspraken per dag op begintijd
  for (const items of map.values()) {
    items.occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  return map;
}
