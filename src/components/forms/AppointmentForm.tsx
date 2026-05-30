import { useState, type ReactNode } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { Appointment, EventOverride, Occurrence, RecurrenceRule } from '../../types/models';
import { useApp } from '../../store/AppContext';
import { Sheet } from '../ui/Sheet';
import { UserPicker } from '../UserPicker';
import { RecurrenceEditor } from './RecurrenceEditor';
import { EditScopeDialog } from './EditScopeDialog';
import { combineDateTime, dayKey, parse, toLocalISO, toTimeInput } from '../../lib/date';
import { addHours } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  /** De master-afspraak bij bewerken. */
  appointment?: Appointment;
  /** De concrete instantie die bewerkt wordt (voor reeksen). */
  occurrence?: Occurrence;
  /** Standaarddatum (yyyy-MM-dd) bij nieuw aanmaken. */
  defaultDate?: string;
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-slate-500">{children}</label>;
}

export function AppointmentForm({ open, onClose, appointment, occurrence, defaultDate }: Props) {
  const { users, locations, addAppointment, updateAppointmentSeries, updateOccurrence, removeAppointment, removeOccurrence, addLocation } = useApp();

  const isEdit = !!appointment;
  // Bij een reeks-instantie tonen we de effectieve (eventueel afwijkende) waarden.
  const initStart = occurrence ? occurrence.start : appointment ? parse(appointment.start) : defaultDate ? combineDateTime(defaultDate, '09:00') : combineDateTime(dayKey(new Date()), '09:00');
  const initEnd = occurrence ? occurrence.end : appointment ? parse(appointment.end) : addHours(initStart, 1);

  const [title, setTitle] = useState(occurrence?.title ?? appointment?.title ?? '');
  const [description, setDescription] = useState(occurrence?.description ?? appointment?.description ?? '');
  const [locationId, setLocationId] = useState<string | null>(
    occurrence?.locationId ?? appointment?.locationId ?? null,
  );
  const [allDay, setAllDay] = useState<boolean>(occurrence?.allDay ?? appointment?.allDay ?? false);
  const [startDate, setStartDate] = useState(dayKey(initStart));
  const [startTime, setStartTime] = useState(toTimeInput(initStart));
  const [endDate, setEndDate] = useState(dayKey(initEnd));
  const [endTime, setEndTime] = useState(toTimeInput(initEnd));
  const [userIds, setUserIds] = useState<string[]>(occurrence?.userIds ?? appointment?.userIds ?? []);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(appointment?.recurrence ?? null);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const [scope, setScope] = useState<null | 'save' | 'delete'>(null);

  // Een bestaande afspraak is een reeks als de master een recurrence heeft.
  const isSeries = isEdit && !!appointment?.recurrence;

  const computeTimes = () => {
    const start = allDay ? combineDateTime(startDate, '00:00') : combineDateTime(startDate, startTime);
    let end = allDay ? combineDateTime(endDate, '23:59') : combineDateTime(endDate, endTime);
    if (end <= start) end = addHours(start, 1);
    return { start, end };
  };

  const buildPayload = () => {
    const { start, end } = computeTimes();
    return {
      title: title.trim(),
      description: description.trim() || undefined,
      locationId,
      start: toLocalISO(start),
      end: toLocalISO(end),
      allDay,
      userIds,
    };
  };

  const doCreate = () => {
    addAppointment({ ...buildPayload(), recurrence });
    onClose();
  };

  const saveSeries = () => {
    if (!appointment) return;
    const payload = buildPayload();
    if (isSeries) {
      // Anker-datum van de reeks behouden; nieuwe tijd-van-de-dag + duur toepassen.
      const anchor = parse(appointment.start);
      const { start, end } = computeTimes();
      const duration = end.getTime() - start.getTime();
      const newStart = combineDateTime(dayKey(anchor), allDay ? '00:00' : startTime);
      const newEnd = new Date(newStart.getTime() + duration);
      updateAppointmentSeries(appointment.id, {
        title: payload.title,
        description: payload.description,
        locationId: payload.locationId,
        allDay,
        userIds,
        recurrence,
        start: toLocalISO(newStart),
        end: toLocalISO(newEnd),
      });
    } else {
      updateAppointmentSeries(appointment.id, { ...payload, recurrence });
    }
    onClose();
  };

  const saveSingle = () => {
    if (!appointment || !occurrence) return;
    const payload = buildPayload();
    const override: EventOverride = {
      title: payload.title,
      description: payload.description,
      locationId: payload.locationId,
      start: payload.start,
      end: payload.end,
      allDay,
      userIds,
    };
    updateOccurrence(appointment.id, occurrence.occurrenceKey, override);
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (!isEdit) return doCreate();
    if (isSeries && occurrence) {
      setScope('save'); // vraag deze afspraak vs hele reeks
    } else {
      saveSeries();
    }
  };

  const handleDelete = () => {
    if (!appointment) return;
    if (isSeries && occurrence) {
      setScope('delete');
    } else {
      removeAppointment(appointment.id);
      onClose();
    }
  };

  const handleAddLocation = () => {
    const name = newLocationName.trim();
    if (!name) return;
    const loc = addLocation({ name });
    setLocationId(loc.id);
    setNewLocationName('');
    setShowNewLocation(false);
  };

  return (
    <>
      <Sheet
        open={open && scope === null}
        onClose={onClose}
        title={isEdit ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
        footer={
          <div className="flex gap-2">
            {isEdit && (
              <button className="btn-danger" onClick={handleDelete} aria-label="Verwijderen">
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
              placeholder="Bijv. Voetbaltraining"
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
            <Label>Locatie</Label>
            {showNewLocation ? (
              <div className="flex gap-2">
                <input
                  className="field"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Naam nieuwe locatie"
                  autoFocus
                />
                <button className="btn-primary" onClick={handleAddLocation}>
                  Toevoegen
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  className="field"
                  value={locationId ?? ''}
                  onChange={(e) => setLocationId(e.target.value || null)}
                >
                  <option value="">Geen locatie</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-ghost shrink-0"
                  onClick={() => setShowNewLocation(true)}
                  aria-label="Nieuwe locatie"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            Hele dag
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Van</Label>
              <input type="date" className="field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            {!allDay && (
              <div>
                <Label>Tijd</Label>
                <input type="time" className="field" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Tot</Label>
              <input type="date" className="field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {!allDay && (
              <div>
                <Label>Tijd</Label>
                <input type="time" className="field" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            )}
          </div>

          <div>
            <Label>Voor wie</Label>
            <UserPicker users={users} selected={userIds} onChange={setUserIds} />
          </div>

          {/* Herhaling alleen instelbaar op reeks-niveau */}
          {(!isEdit || !occurrence || !isSeries) && (
            <div className="rounded-2xl bg-slate-50 p-3">
              <RecurrenceEditor value={recurrence} onChange={setRecurrence} />
            </div>
          )}
          {isSeries && occurrence && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Dit is een afspraak uit een reeks. Herhaling pas je aan via "Hele reeks".
            </p>
          )}
        </div>
      </Sheet>

      <EditScopeDialog
        open={scope !== null}
        mode={scope ?? 'save'}
        onClose={() => setScope(null)}
        onChooseSingle={() => {
          if (scope === 'delete') {
            if (appointment && occurrence) removeOccurrence(appointment.id, occurrence.occurrenceKey);
            onClose();
          } else {
            saveSingle();
          }
          setScope(null);
        }}
        onChooseSeries={() => {
          if (scope === 'delete') {
            if (appointment) removeAppointment(appointment.id);
            onClose();
          } else {
            saveSeries();
          }
          setScope(null);
        }}
      />
    </>
  );
}
