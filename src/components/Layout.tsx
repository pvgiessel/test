import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, MapPin, Users, User as UserIcon } from 'lucide-react';
import type { ComponentType } from 'react';

const NAV: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: '/', label: 'Planning', icon: CalendarDays },
  { to: '/locations', label: 'Locaties', icon: MapPin },
  { to: '/family', label: 'Gezin', icon: Users },
  { to: '/profile', label: 'Profiel', icon: UserIcon },
];

export function Layout() {
  return (
    <div className="min-h-dvh bg-slate-100 md:flex">
      {/* Zijbalk (iPad/desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Gezinsplanner</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Inhoud */}
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* Onderbalk (mobiel) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
