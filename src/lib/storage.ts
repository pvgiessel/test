import type { Appointment, FamilyLocation, Task, User } from '../types/models';
import { uid } from './id';
import { dayKey, toLocalISO } from './date';
import { addDays } from 'date-fns';

const PREFIX = 'gezinsplanner.v1.';

export interface AppData {
  users: User[];
  locations: FamilyLocation[];
  appointments: Appointment[];
  tasks: Task[];
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* opslag vol of niet beschikbaar — stilletjes negeren in demo */
  }
}

export const storage = {
  loadUsers: () => read<User[]>('users', []),
  saveUsers: (u: User[]) => write('users', u),

  loadLocations: () => read<FamilyLocation[]>('locations', []),
  saveLocations: (l: FamilyLocation[]) => write('locations', l),

  loadAppointments: () => read<Appointment[]>('appointments', []),
  saveAppointments: (a: Appointment[]) => write('appointments', a),

  loadTasks: () => read<Task[]>('tasks', []),
  saveTasks: (t: Task[]) => write('tasks', t),

  loadCurrentUserId: () => read<string | null>('currentUserId', null),
  saveCurrentUserId: (id: string | null) => write('currentUserId', id),

  isSeeded: () => read<boolean>('seeded', false),
  markSeeded: () => write('seeded', true),
};

/** Maak een eenmalige set voorbeelddata aan (alleen bij eerste start). */
export function seedIfEmpty(): AppData {
  if (storage.isSeeded()) {
    return {
      users: storage.loadUsers(),
      locations: storage.loadLocations(),
      appointments: storage.loadAppointments(),
      tasks: storage.loadTasks(),
    };
  }

  const papa: User = { id: uid('u_'), name: 'Papa', color: '#1f47d8', avatarEmoji: '👨' };
  const mama: User = { id: uid('u_'), name: 'Mama', color: '#db2777', avatarEmoji: '👩' };
  const sam: User = { id: uid('u_'), name: 'Sam', color: '#0d9488', avatarEmoji: '🧒' };
  const evi: User = { id: uid('u_'), name: 'Evi', color: '#ca8a04', avatarEmoji: '👧' };
  const users = [papa, mama, sam, evi];

  const school: FamilyLocation = { id: uid('l_'), name: 'School De Regenboog', address: 'Schoolstraat 1' };
  const sportclub: FamilyLocation = { id: uid('l_'), name: 'Sporthal Noord', address: 'Sportlaan 12' };
  const thuis: FamilyLocation = { id: uid('l_'), name: 'Thuis' };
  const locations = [school, sportclub, thuis];

  const today = new Date();
  const at = (offsetDays: number, h: number, m: number) => {
    const d = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m), offsetDays);
    return toLocalISO(d);
  };

  const appointments: Appointment[] = [
    {
      id: uid('a_'),
      title: 'Voetbaltraining',
      description: 'Vergeet de scheenbeschermers niet!',
      locationId: sportclub.id,
      start: at(1, 18, 0),
      end: at(1, 19, 30),
      userIds: [sam.id],
      recurrence: { freq: 'WEEKLY', interval: 1, byweekday: [2, 4] },
    },
    {
      id: uid('a_'),
      title: 'Ouderavond',
      description: 'Gesprek met de juf over het rapport.',
      locationId: school.id,
      start: at(3, 19, 30),
      end: at(3, 20, 30),
      userIds: [papa.id, mama.id],
    },
    {
      id: uid('a_'),
      title: 'Zwemles',
      locationId: sportclub.id,
      start: at(2, 16, 0),
      end: at(2, 16, 45),
      userIds: [evi.id],
      recurrence: { freq: 'WEEKLY', interval: 1, byweekday: [6] },
    },
    {
      id: uid('a_'),
      title: 'Familie-uitje dierentuin',
      description: 'Hele dag eropuit.',
      locationId: null,
      start: at(6, 9, 0),
      end: at(6, 17, 0),
      allDay: true,
      userIds: [papa.id, mama.id, sam.id, evi.id],
    },
  ];

  const tasks: Task[] = [
    {
      id: uid('t_'),
      title: 'Boodschappen doen',
      description: 'Melk, brood, groente en fruit.',
      date: dayKey(today),
      userIds: [mama.id],
      completed: false,
    },
    {
      id: uid('t_'),
      title: 'Auto naar de garage',
      date: dayKey(addDays(today, 2)),
      userIds: [papa.id],
      completed: false,
    },
    {
      id: uid('t_'),
      title: 'Kamer opruimen',
      userIds: [sam.id, evi.id],
      completed: false,
    },
    {
      id: uid('t_'),
      title: 'Verjaardagscadeau oma kopen',
      date: dayKey(addDays(today, 4)),
      userIds: [mama.id, papa.id],
      completed: true,
      completedAt: new Date().toISOString(),
    },
  ];

  storage.saveUsers(users);
  storage.saveLocations(locations);
  storage.saveAppointments(appointments);
  storage.saveTasks(tasks);
  storage.markSeeded();

  return { users, locations, appointments, tasks };
}
