// Vertaalt database-rijen (snake_case) naar app-modellen (camelCase) en terug.
import type {
  Appointment,
  FamilyLocation,
  Household,
  Task,
  User,
} from '../types/models';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function rowToUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    avatarEmoji: r.avatar_emoji ?? undefined,
    avatarImage: r.avatar_image ?? undefined,
  };
}

export function rowToHousehold(r: any): Household {
  return { id: r.id, name: r.name, inviteCode: r.invite_code };
}

export function rowToLocation(r: any): FamilyLocation {
  return {
    id: r.id,
    name: r.name,
    address: r.address ?? undefined,
    notes: r.notes ?? undefined,
  };
}

export function rowToAppointment(r: any): Appointment {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    locationId: r.location_id ?? null,
    start: r.start_at,
    end: r.end_at,
    allDay: r.all_day ?? false,
    userIds: r.user_ids ?? [],
    recurrence: r.recurrence ?? null,
    overrides: r.overrides ?? {},
    createdBy: r.created_by ?? undefined,
  };
}

export function rowToTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    date: r.date ?? null,
    userIds: r.user_ids ?? [],
    completed: r.completed ?? false,
    completedAt: r.completed_at ?? null,
    createdBy: r.created_by ?? undefined,
  };
}
