import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type {
  Appointment,
  EventOverride,
  FamilyLocation,
  Household,
  Task,
  User,
} from '../types/models';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  rowToAppointment,
  rowToHousehold,
  rowToLocation,
  rowToTask,
  rowToUser,
} from '../lib/mappers';

export type AppStatus =
  | 'loading'
  | 'unconfigured'
  | 'unauthenticated'
  | 'onboarding'
  | 'ready';

interface AuthResult {
  error?: string;
}

interface AppContextValue {
  status: AppStatus;
  isConfigured: boolean;
  session: Session | null;
  currentUser: User | null;
  household: Household | null;

  // data
  users: User[];
  locations: FamilyLocation[];
  appointments: Appointment[];
  tasks: Task[];

  // auth
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  logout: () => Promise<void>;

  // onboarding
  createHousehold: (familyName: string, profileName: string, color: string, emoji: string) => Promise<AuthResult>;
  joinHousehold: (code: string, profileName: string, color: string, emoji: string) => Promise<AuthResult>;

  // profiel (alleen jezelf)
  updateUser: (id: string, patch: Partial<User>) => Promise<void>;

  // locations
  addLocation: (data: Omit<FamilyLocation, 'id'>) => Promise<FamilyLocation>;
  updateLocation: (id: string, patch: Partial<FamilyLocation>) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;

  // appointments
  addAppointment: (data: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointmentSeries: (id: string, patch: Partial<Appointment>) => Promise<void>;
  updateOccurrence: (id: string, occurrenceKey: string, override: EventOverride) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
  removeOccurrence: (id: string, occurrenceKey: string) => Promise<void>;

  // tasks
  addTask: (data: Omit<Task, 'id' | 'completed'>) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'Er ging iets mis';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppStatus>(isSupabaseConfigured ? 'loading' : 'unconfigured');
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<FamilyLocation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ---- laden ----------------------------------------------------------------
  const loadData = async (hhId: string) => {
    if (!supabase) return;
    const [loc, app, tsk, prof] = await Promise.all([
      supabase.from('locations').select('*').eq('household_id', hhId),
      supabase.from('appointments').select('*').eq('household_id', hhId),
      supabase.from('tasks').select('*').eq('household_id', hhId),
      supabase.from('profiles').select('*').eq('household_id', hhId),
    ]);
    setLocations((loc.data ?? []).map(rowToLocation));
    setAppointments((app.data ?? []).map(rowToAppointment));
    setTasks((tsk.data ?? []).map(rowToTask));
    setUsers((prof.data ?? []).map(rowToUser));
  };

  const loadProfileAndData = async (s: Session) => {
    if (!supabase) return;
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', s.user.id)
      .maybeSingle();
    if (!prof) {
      setStatus('onboarding');
      return;
    }
    setCurrentUser(rowToUser(prof));
    setHouseholdId(prof.household_id);
    const { data: hh } = await supabase
      .from('households')
      .select('*')
      .eq('id', prof.household_id)
      .maybeSingle();
    if (hh) setHousehold(rowToHousehold(hh));
    await loadData(prof.household_id);
    setStatus('ready');
  };

  // ---- auth-sessie volgen ----------------------------------------------------
  useEffect(() => {
    if (!supabase) return; // status is dan al 'unconfigured'
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void loadProfileAndData(data.session);
      } else {
        setStatus('unauthenticated');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        setStatus('loading');
        void loadProfileAndData(s);
      } else {
        setCurrentUser(null);
        setHousehold(null);
        setHouseholdId(null);
        setUsers([]);
        setLocations([]);
        setAppointments([]);
        setTasks([]);
        setStatus('unauthenticated');
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- realtime: live updates tussen apparaten -------------------------------
  useEffect(() => {
    if (!supabase || !householdId) return;
    const sb = supabase;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleReload = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void loadData(householdId);
      }, 250);
    };
    const filter = `household_id=eq.${householdId}`;
    const channel = sb
      .channel(`household-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations', filter }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter }, scheduleReload)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      void sb.removeChannel(channel);
    };
  }, [householdId]);

  // ---- helpers ---------------------------------------------------------------
  const requireCtx = () => {
    if (!supabase || !householdId || !currentUser) throw new Error('Niet ingelogd');
    return { sb: supabase, hhId: householdId, uid: currentUser.id };
  };

  const patchAppointment = async (id: string, dbPatch: Record<string, unknown>) => {
    const { sb } = requireCtx();
    const { data, error } = await sb.from('appointments').update(dbPatch).eq('id', id).select().single();
    if (error) throw error;
    const updated = rowToAppointment(data);
    setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  // ---- auth ------------------------------------------------------------------
  const signIn: AppContextValue['signIn'] = async (email, password) => {
    if (!supabase) return { error: 'Niet geconfigureerd' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: errMsg(error) } : {};
  };

  const signUp: AppContextValue['signUp'] = async (email, password) => {
    if (!supabase) return { error: 'Niet geconfigureerd' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: errMsg(error) };
    // Geen sessie = e-mailbevestiging staat aan in Supabase.
    return { needsConfirmation: !data.session };
  };

  const logout: AppContextValue['logout'] = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  // ---- onboarding ------------------------------------------------------------
  const finishOnboarding = (result: { household: unknown; profile: unknown }) => {
    const hh = rowToHousehold(result.household);
    const prof = rowToUser(result.profile);
    setHousehold(hh);
    setHouseholdId(hh.id);
    setCurrentUser(prof);
    void loadData(hh.id);
    setStatus('ready');
  };

  const createHousehold: AppContextValue['createHousehold'] = async (familyName, profileName, color, emoji) => {
    if (!supabase) return { error: 'Niet geconfigureerd' };
    const { data, error } = await supabase.rpc('create_household', {
      family_name: familyName,
      profile_name: profileName,
      profile_color: color,
      profile_emoji: emoji,
    });
    if (error) return { error: errMsg(error) };
    finishOnboarding(data as { household: unknown; profile: unknown });
    return {};
  };

  const joinHousehold: AppContextValue['joinHousehold'] = async (code, profileName, color, emoji) => {
    if (!supabase) return { error: 'Niet geconfigureerd' };
    const { data, error } = await supabase.rpc('join_household', {
      code,
      profile_name: profileName,
      profile_color: color,
      profile_emoji: emoji,
    });
    if (error) return { error: errMsg(error) };
    finishOnboarding(data as { household: unknown; profile: unknown });
    return {};
  };

  // ---- profiel ---------------------------------------------------------------
  const updateUser: AppContextValue['updateUser'] = async (id, patch) => {
    const { sb } = requireCtx();
    const dbPatch: Record<string, unknown> = {};
    if ('name' in patch) dbPatch.name = patch.name;
    if ('color' in patch) dbPatch.color = patch.color;
    if ('avatarEmoji' in patch) dbPatch.avatar_emoji = patch.avatarEmoji ?? null;
    if ('avatarImage' in patch) dbPatch.avatar_image = patch.avatarImage ?? null;
    const { data, error } = await sb.from('profiles').update(dbPatch).eq('id', id).select().single();
    if (error) throw error;
    const updated = rowToUser(data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    if (currentUser?.id === id) setCurrentUser(updated);
  };

  // ---- locations -------------------------------------------------------------
  const addLocation: AppContextValue['addLocation'] = async (data) => {
    const { sb, hhId } = requireCtx();
    const { data: row, error } = await sb
      .from('locations')
      .insert({ household_id: hhId, name: data.name, address: data.address ?? null, notes: data.notes ?? null })
      .select()
      .single();
    if (error) throw error;
    const loc = rowToLocation(row);
    setLocations((prev) => [...prev, loc]);
    return loc;
  };

  const updateLocation: AppContextValue['updateLocation'] = async (id, patch) => {
    const { sb } = requireCtx();
    const dbPatch: Record<string, unknown> = {};
    if ('name' in patch) dbPatch.name = patch.name;
    if ('address' in patch) dbPatch.address = patch.address ?? null;
    if ('notes' in patch) dbPatch.notes = patch.notes ?? null;
    const { data, error } = await sb.from('locations').update(dbPatch).eq('id', id).select().single();
    if (error) throw error;
    const loc = rowToLocation(data);
    setLocations((prev) => prev.map((l) => (l.id === id ? loc : l)));
  };

  const removeLocation: AppContextValue['removeLocation'] = async (id) => {
    const { sb } = requireCtx();
    const { error } = await sb.from('locations').delete().eq('id', id);
    if (error) throw error;
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setAppointments((prev) => prev.map((a) => (a.locationId === id ? { ...a, locationId: null } : a)));
  };

  // ---- appointments ----------------------------------------------------------
  const addAppointment: AppContextValue['addAppointment'] = async (data) => {
    const { sb, hhId, uid } = requireCtx();
    const { data: row, error } = await sb
      .from('appointments')
      .insert({
        household_id: hhId,
        title: data.title,
        description: data.description ?? null,
        location_id: data.locationId ?? null,
        start_at: data.start,
        end_at: data.end,
        all_day: data.allDay ?? false,
        user_ids: data.userIds,
        recurrence: data.recurrence ?? null,
        overrides: data.overrides ?? {},
        created_by: uid,
      })
      .select()
      .single();
    if (error) throw error;
    const appt = rowToAppointment(row);
    setAppointments((prev) => [...prev, appt]);
    return appt;
  };

  const updateAppointmentSeries: AppContextValue['updateAppointmentSeries'] = async (id, patch) => {
    const dbPatch: Record<string, unknown> = {};
    if ('title' in patch) dbPatch.title = patch.title;
    if ('description' in patch) dbPatch.description = patch.description ?? null;
    if ('locationId' in patch) dbPatch.location_id = patch.locationId ?? null;
    if ('start' in patch) dbPatch.start_at = patch.start;
    if ('end' in patch) dbPatch.end_at = patch.end;
    if ('allDay' in patch) dbPatch.all_day = patch.allDay;
    if ('userIds' in patch) dbPatch.user_ids = patch.userIds;
    if ('recurrence' in patch) dbPatch.recurrence = patch.recurrence ?? null;
    if ('overrides' in patch) dbPatch.overrides = patch.overrides ?? {};
    await patchAppointment(id, dbPatch);
  };

  const updateOccurrence: AppContextValue['updateOccurrence'] = async (id, occurrenceKey, override) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const overrides = { ...(appt.overrides ?? {}) };
    overrides[occurrenceKey] = { ...overrides[occurrenceKey], ...override };
    await patchAppointment(id, { overrides });
  };

  const removeAppointment: AppContextValue['removeAppointment'] = async (id) => {
    const { sb } = requireCtx();
    const { error } = await sb.from('appointments').delete().eq('id', id);
    if (error) throw error;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const removeOccurrence: AppContextValue['removeOccurrence'] = async (id, occurrenceKey) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const overrides = { ...(appt.overrides ?? {}) };
    overrides[occurrenceKey] = { ...overrides[occurrenceKey], deleted: true };
    await patchAppointment(id, { overrides });
  };

  // ---- tasks -----------------------------------------------------------------
  const addTask: AppContextValue['addTask'] = async (data) => {
    const { sb, hhId, uid } = requireCtx();
    const { data: row, error } = await sb
      .from('tasks')
      .insert({
        household_id: hhId,
        title: data.title,
        description: data.description ?? null,
        date: data.date ?? null,
        user_ids: data.userIds,
        completed: false,
        created_by: uid,
      })
      .select()
      .single();
    if (error) throw error;
    const task = rowToTask(row);
    setTasks((prev) => [...prev, task]);
    return task;
  };

  const updateTask: AppContextValue['updateTask'] = async (id, patch) => {
    const { sb } = requireCtx();
    const dbPatch: Record<string, unknown> = {};
    if ('title' in patch) dbPatch.title = patch.title;
    if ('description' in patch) dbPatch.description = patch.description ?? null;
    if ('date' in patch) dbPatch.date = patch.date ?? null;
    if ('userIds' in patch) dbPatch.user_ids = patch.userIds;
    if ('completed' in patch) dbPatch.completed = patch.completed;
    const { data, error } = await sb.from('tasks').update(dbPatch).eq('id', id).select().single();
    if (error) throw error;
    const task = rowToTask(data);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
  };

  const toggleTask: AppContextValue['toggleTask'] = async (id) => {
    const { sb } = requireCtx();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    const { data, error } = await sb
      .from('tasks')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const updated = rowToTask(data);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask: AppContextValue['removeTask'] = async (id) => {
    const { sb } = requireCtx();
    const { error } = await sb.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      status,
      isConfigured: isSupabaseConfigured,
      session,
      currentUser,
      household,
      users,
      locations,
      appointments,
      tasks,
      signIn,
      signUp,
      logout,
      createHousehold,
      joinHousehold,
      updateUser,
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, session, currentUser, household, users, locations, appointments, tasks],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp moet binnen <AppProvider> gebruikt worden');
  return ctx;
}
