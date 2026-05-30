import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CalendarDays, Loader2, Database } from 'lucide-react';
import { AppProvider, useApp } from './store/AppContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PlanningPage } from './pages/PlanningPage';
import { LocationsPage } from './pages/LocationsPage';
import { FamilyPage } from './pages/FamilyPage';
import { ProfilePage } from './pages/ProfilePage';

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <CalendarDays className="h-10 w-10" />
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function ConfigNeeded() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
        <Database className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-extrabold text-slate-900">Database nog niet ingesteld</h1>
      <p className="max-w-md text-sm text-slate-500">
        Stel de omgevingsvariabelen <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_URL</code> en{' '}
        <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_ANON_KEY</code> in (zie de README), en herstart de
        app. Daarna werken accounts en synchronisatie tussen apparaten.
      </p>
    </div>
  );
}

function Gate() {
  const { status } = useApp();
  if (status === 'loading') return <Splash />;
  if (status === 'unconfigured') return <ConfigNeeded />;
  if (status === 'unauthenticated') return <AuthPage />;
  if (status === 'onboarding') return <OnboardingPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PlanningPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Gate />
      </BrowserRouter>
    </AppProvider>
  );
}
