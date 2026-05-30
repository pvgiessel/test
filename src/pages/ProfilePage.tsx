import { useNavigate } from 'react-router-dom';
import { LogOut, CalendarDays, ListChecks } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Avatar } from '../components/Avatar';

export function ProfilePage() {
  const { currentUser, appointments, tasks, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myAppointments = appointments.filter((a) => a.userIds.includes(currentUser.id)).length;
  const myOpenTasks = tasks.filter(
    (t) => t.userIds.includes(currentUser.id) && !t.completed,
  ).length;

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-safe">
      <header className="py-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Profiel</h1>
      </header>

      <div className="card flex flex-col items-center gap-3 p-6">
        <Avatar user={currentUser} size="lg" />
        <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{myAppointments}</p>
            <p className="text-xs text-slate-400">afspraken</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-task-100 text-task-600">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{myOpenTasks}</p>
            <p className="text-xs text-slate-400">open taken</p>
          </div>
        </div>
      </div>

      <button className="btn-ghost mt-6 w-full" onClick={onLogout}>
        <LogOut className="h-4 w-4" /> Uitloggen
      </button>

      <p className="mt-6 text-center text-xs text-slate-400">
        Gegevens worden lokaal op dit apparaat bewaard.
      </p>
    </div>
  );
}
