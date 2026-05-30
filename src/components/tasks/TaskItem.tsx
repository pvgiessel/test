import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, RotateCcw, MapPin, CalendarDays } from 'lucide-react';
import type { Task, User } from '../../types/models';
import { Avatar } from '../Avatar';
import { dateOnly, fmtDayLong } from '../../lib/date';

const SWIPE_THRESHOLD = 90;

export function TaskItem({
  task,
  users,
  onToggle,
  onOpen,
}: {
  task: Task;
  users: User[];
  onToggle: () => void;
  onOpen: () => void;
}) {
  const x = useMotionValue(0);
  // Achtergrond-actie verschijnt geleidelijk tijdens het swipen.
  const actionOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const taskUsers = users.filter((u) => task.userIds.includes(u.id));

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Achtergrond die zichtbaar wordt tijdens swipen */}
      <motion.div
        style={{ opacity: actionOpacity }}
        className={`absolute inset-0 flex items-center gap-2 px-5 text-sm font-semibold text-white ${
          task.completed ? 'bg-slate-400' : 'bg-emerald-500'
        }`}
      >
        {task.completed ? <RotateCcw className="h-5 w-5" /> : <Check className="h-5 w-5" />}
        {task.completed ? 'Heropenen' : 'Afhandelen'}
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.15, right: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) onToggle();
        }}
        onClick={onOpen}
        className="relative flex cursor-pointer items-start gap-3 border border-slate-100 bg-white px-4 py-3 no-select"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.completed ? 'border-task-500 bg-task-500 text-white' : 'border-slate-300 bg-white'
          }`}
          aria-label={task.completed ? 'Heropenen' : 'Afhandelen'}
        >
          {task.completed && <Check className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className={`truncate text-xs ${task.completed ? 'text-slate-300' : 'text-slate-500'}`}>
              {task.description}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            {task.date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {fmtDayLong(dateOnly(task.date))}
              </span>
            )}
            {taskUsers.length === 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                geen gezinslid
              </span>
            )}
          </div>
        </div>

        <div className="flex -space-x-1.5">
          {taskUsers.map((u) => (
            <Avatar key={u.id} user={u} size="sm" ring />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
