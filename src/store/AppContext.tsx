import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Appointment, EventOverride, FamilyLocation, Task, User } from '../types/models';
import { seedIfEmpty, storage } from '../lib/storage';
import { uid } from '../lib/id';

interface AppContextValue {
  // data
  users: User[];
  locations: FamilyLocation[];
  appointments: Appointment[];
  tasks: Task[];

  // auth (demo)
  currentUser: User | null;
  login: (userId: string, pin?: string) => boolean;
  logout: () => void;

  // users
  addUser: (data: Omit<User, 'id'>) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;

  // locations
  addLocation: (data: Omit<FamilyLocation, 'id'>) => FamilyLocation;
  updateLocation: (id: string, patch: Partial<FamilyLocation>) => void;
  removeLocation: (id: string) => void;

  // appointments
  addAppointment: (data: Omit<Appointment, 'id'>) => Appointment;
  /** Werk de hele reeks (of een eenmalige afspraak) bij. */
  updateAppointmentSeries: (id: string, patch: Partial<Appointment>) => void;
  /** Werk één losse afspraak binnen een reeks bij via een afwijking. */
  updateOccurrence: (id: string, occurrenceKey: string, override: EventOverride) => void;
  /** Verwijder de hele reeks / eenmalige afspraak. */
  removeAppointment: (id: string) => void;
  /** Verwijder één losse afspraak uit een reeks. */
  removeOccurrence: (id: string, occurrenceKey: string) => void;

  // tasks
  addTask: (data: Omit<Task, 'id' | 'completed'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => seedIfEmpty(), []);
  const [users, setUsers] = useState<User[]>(seed.users);
  const [locations, setLocations] = useState<FamilyLocation[]>(seed.locations);
  const [appointments, setAppointments] = useState<Appointment[]>(seed.appointments);
  const [tasks, setTasks] = useState<Task[]>(seed.tasks);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    storage.loadCurrentUserId(),
  );

  useEffect(() => storage.saveUsers(users), [users]);
  useEffect(() => storage.saveLocations(locations), [locations]);
  useEffect(() => storage.saveAppointments(appointments), [appointments]);
  useEffect(() => storage.saveTasks(tasks), [tasks]);
  useEffect(() => storage.saveCurrentUserId(currentUserId), [currentUserId]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId],
  );

  const login = useCallback(
    (userId: string, pin?: string) => {
      const u = users.find((x) => x.id === userId);
      if (!u) return false;
      if (u.pin && u.pin !== pin) return false;
      setCurrentUserId(userId);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => setCurrentUserId(null), []);

  // ---- users ----
  const addUser: AppContextValue['addUser'] = useCallback((data) => {
    const user: User = { ...data, id: uid('u_') };
    setUsers((prev) => [...prev, user]);
    return user;
  }, []);
  const updateUser: AppContextValue['updateUser'] = useCallback((id, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);
  const removeUser: AppContextValue['removeUser'] = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // ontkoppel uit afspraken en taken
    setAppointments((prev) =>
      prev.map((a) => ({ ...a, userIds: a.userIds.filter((x) => x !== id) })),
    );
    setTasks((prev) => prev.map((t) => ({ ...t, userIds: t.userIds.filter((x) => x !== id) })));
    setCurrentUserId((cur) => (cur === id ? null : cur));
  }, []);

  // ---- locations ----
  const addLocation: AppContextValue['addLocation'] = useCallback((data) => {
    const loc: FamilyLocation = { ...data, id: uid('l_') };
    setLocations((prev) => [...prev, loc]);
    return loc;
  }, []);
  const updateLocation: AppContextValue['updateLocation'] = useCallback((id, patch) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);
  const removeLocation: AppContextValue['removeLocation'] = useCallback((id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setAppointments((prev) =>
      prev.map((a) => (a.locationId === id ? { ...a, locationId: null } : a)),
    );
  }, []);

  // ---- appointments ----
  const addAppointment: AppContextValue['addAppointment'] = useCallback((data) => {
    const appt: Appointment = { ...data, id: uid('a_') };
    setAppointments((prev) => [...prev, appt]);
    return appt;
  }, []);

  const updateAppointmentSeries: AppContextValue['updateAppointmentSeries'] = useCallback(
    (id, patch) => {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [],
  );

  const updateOccurrence: AppContextValue['updateOccurrence'] = useCallback(
    (id, occurrenceKey, override) => {
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const overrides = { ...(a.overrides ?? {}) };
          overrides[occurrenceKey] = { ...overrides[occurrenceKey], ...override };
          return { ...a, overrides };
        }),
      );
    },
    [],
  );

  const removeAppointment: AppContextValue['removeAppointment'] = useCallback((id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const removeOccurrence: AppContextValue['removeOccurrence'] = useCallback(
    (id, occurrenceKey) => {
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const overrides = { ...(a.overrides ?? {}) };
          overrides[occurrenceKey] = { ...overrides[occurrenceKey], deleted: true };
          return { ...a, overrides };
        }),
      );
    },
    [],
  );

  // ---- tasks ----
  const addTask: AppContextValue['addTask'] = useCallback((data) => {
    const task: Task = { ...data, id: uid('t_'), completed: false };
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);
  const updateTask: AppContextValue['updateTask'] = useCallback((id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const toggleTask: AppContextValue['toggleTask'] = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
          : t,
      ),
    );
  }, []);
  const removeTask: AppContextValue['removeTask'] = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: AppContextValue = {
    users,
    locations,
    appointments,
    tasks,
    currentUser,
    login,
    logout,
    addUser,
    updateUser,
    removeUser,
    addLocation,
    updateLocation,
    removeLocation,
    addAppointment,
    updateAppointmentSeries,
    updateOccurrence,
    removeAppointment,
    removeOccurrence,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp moet binnen <AppProvider> gebruikt worden');
  return ctx;
}
