import { useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import type { Task } from '../../types/models';
import { useApp } from '../../store/AppContext';
import { Sheet } from '../ui/Sheet';
import { UserPicker } from '../UserPicker';

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-slate-500">{children}</label>;
}

export function TaskForm({
  open,
  onClose,
  task,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task;
  defaultDate?: string;
}) {
  const { users, addTask, updateTask, removeTask } = useApp();
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [date, setDate] = useState<string>(task?.date ?? defaultDate ?? '');
  const [userIds, setUserIds] = useState<string[]>(task?.userIds ?? []);

  const handleSave = async () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || null,
      userIds,
    };
    if (task) await updateTask(task.id, payload);
    else await addTask(payload);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Taak bewerken' : 'Nieuwe taak'}
      footer={
        <div className="flex gap-2">
          {isEdit && (
            <button
              className="btn-danger"
              onClick={() => {
                if (task) void removeTask(task.id);
                onClose();
              }}
              aria-label="Verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button className="btn-ghost flex-1" onClick={onClose}>
            Annuleren
          </button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={!title.trim()}>
            Opslaan
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Omschrijving</Label>
          <input
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bijv. Boodschappen doen"
            autoFocus
          />
        </div>
        <div>
          <Label>Toelichting</Label>
          <textarea
            className="field min-h-[72px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uitgebreide toelichting (optioneel)"
          />
        </div>
        <div>
          <Label>Datum (optioneel — verschijnt dan in de kalender)</Label>
          <input type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Voor wie</Label>
          <UserPicker users={users} selected={userIds} onChange={setUserIds} />
        </div>
      </div>
    </Sheet>
  );
}
