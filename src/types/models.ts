// Centrale datamodellen voor de gezinsplanner.
// De opslag is nu lokaal (zie src/lib/storage.ts), maar de modellen zijn zo
// opgezet dat ze 1-op-1 naar een backend (Supabase/Firebase) te mappen zijn.

export interface User {
  id: string;
  name: string;
  /** Hex-kleur die als achtergrond voor de avatar en als accent wordt gebruikt. */
  color: string;
  /** Optionele emoji als avatar. */
  avatarEmoji?: string;
  /** Optionele afbeelding (data-URL) als avatar. */
  avatarImage?: string;
}

/** Een gezin/huishouden waaronder alle data valt. */
export interface Household {
  id: string;
  name: string;
  /** Code waarmee andere gezinsleden zich kunnen aansluiten. */
  inviteCode: string;
}

export interface FamilyLocation {
  id: string;
  name: string;
  address?: string;
  notes?: string;
}

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/** Weekdagen, ISO-stijl (1 = maandag ... 7 = zondag). */
export type WeekdayNum = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  /** Elke N dagen/weken/maanden/jaren. Standaard 1. */
  interval: number;
  /** Voor WEEKLY: op welke weekdagen. */
  byweekday?: WeekdayNum[];
  /** Einde: na een aantal herhalingen. */
  count?: number | null;
  /** Einde: op een datum (yyyy-MM-dd). */
  until?: string | null;
}

/** Afwijking van één enkele afspraak binnen een reeks. */
export interface EventOverride {
  /** Deze losse afspraak uit de reeks verwijderen. */
  deleted?: boolean;
  title?: string;
  description?: string;
  locationId?: string | null;
  /** Verplaatste begin-/eindtijd (ISO datetime). */
  start?: string;
  end?: string;
  allDay?: boolean;
  userIds?: string[];
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  locationId?: string | null;
  /** ISO datetime van de (eerste) afspraak. */
  start: string;
  /** ISO datetime einde. */
  end: string;
  allDay?: boolean;
  userIds: string[];
  /** Herhaling; null/undefined = eenmalig. */
  recurrence?: RecurrenceRule | null;
  /**
   * Afwijkingen per losse afspraak in een reeks, met als sleutel de
   * originele begin-ISO van die afspraak.
   */
  overrides?: Record<string, EventOverride>;
  createdBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** Optionele datum (yyyy-MM-dd). Ingevuld => zichtbaar in de kalender. */
  date?: string | null;
  userIds: string[];
  completed: boolean;
  completedAt?: string | null;
  createdBy?: string;
}

/** Een concrete afspraak op de kalender (een uitgerekende instantie van een reeks). */
export interface Occurrence {
  appointmentId: string;
  /** Originele begin-ISO van deze instantie; identificeert ze binnen de reeks. */
  occurrenceKey: string;
  isRecurring: boolean;
  /** True als deze instantie een afwijking van de reeks is. */
  isException: boolean;
  title: string;
  description?: string;
  locationId?: string | null;
  start: Date;
  end: Date;
  allDay?: boolean;
  userIds: string[];
}
