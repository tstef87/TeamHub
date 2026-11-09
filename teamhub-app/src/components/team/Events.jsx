import { useEffect, useState } from "react";
import Icon from "../ui/Icon";
import { FormAlert, TextAreaField, TextField } from "../ui/Field";
import { EventItem } from "./TeamBits";
import { cx } from "../../lib/format";
import { db } from "../../firebase";
import Button from "../../components/ui/Button";
import { addDoc, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const pad = (n) => String(n).padStart(2, "0");

// ISO string -> value for <input type="date"> or <input type="datetime-local"> (local time)
function toInputValue(iso, allDay) {
  const d = new Date(iso);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return allDay ? date : `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const rowBtn =
  "rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:border-crimson hover:text-crimson-ink";

// One event, plus Edit / Remove buttons for admins. EventItem renders an <li>, so it is wrapped in its own <ul>.
function EventRow({ event, onEdit, onRemove }) {
  if (!onEdit && !onRemove) return <EventItem event={event} />;
  return (
    <li className="flex items-start gap-2">
      <ul className="min-w-0 flex-1 list-none">
        <EventItem event={event} />
      </ul>
      <div className="flex shrink-0 gap-2">
        {onEdit && (
          <button onClick={() => onEdit(event)} aria-label={`Edit ${event.title}`} className={rowBtn}>
            Edit
          </button>
        )}
        {onRemove && (
          <button onClick={() => onRemove(event)} aria-label={`Remove ${event.title}`} className={rowBtn}>
            Remove
          </button>
        )}
      </div>
    </li>
  );
}

function CalendarView({ events, onEdit, onRemove }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(null);

  // Group events by local calendar day (by start date)
  const byDay = {};
  events.forEach((e) => {
    const k = dayKey(new Date(e.start));
    (byDay[k] ??= []).push(e);
  });

  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const todayKey = dayKey(new Date());
  const selectedEvents = selected ? byDay[dayKey(selected)] ?? [] : [];

  const shift = (delta) => {
    setMonth(new Date(year, m + delta, 1));
    setSelected(null);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-crimson">
            ←
          </button>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-crimson">
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-line bg-surface text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="border-b border-line py-2 text-xs font-semibold text-muted">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} className="h-14 border-t border-line/50 sm:h-20" />;
          const k = dayKey(d);
          const count = byDay[k]?.length ?? 0;
          const isSelected = selected && dayKey(selected) === k;
          return (
            <button
              key={k}
              onClick={() => setSelected(isSelected ? null : d)}
              aria-pressed={isSelected}
              className={cx(
                "flex h-14 flex-col items-center gap-1 border-t border-line/50 pt-2 text-sm hover:bg-crimson/5 sm:h-20",
                isSelected && "bg-crimson/10",
              )}
            >
              <span
                className={cx(
                  "flex size-7 items-center justify-center rounded-full tabular-nums",
                  k === todayKey && "bg-crimson font-semibold text-white",
                )}
              >
                {d.getDate()}
              </span>
              {count > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-crimson-ink">
                  <span className="size-1.5 rounded-full bg-crimson" />
                  {count > 1 ? `${count} events` : "1 event"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-muted">
            {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          {selectedEvents.length ? (
            <ul className="flex flex-col gap-3">
              {selectedEvents.map((e) => (
                <EventRow key={e.id ?? e.start} event={e} onEdit={onEdit} onRemove={onRemove} />
              ))}
            </ul>
          ) : (
            <p className="text-muted">No events this day.</p>
          )}
        </div>
      )}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm";

function EventForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [start, setStart] = useState(initial?.start ? toInputValue(initial.start, initial.allDay) : "");
  const [end, setEnd] = useState(initial?.end ? toInputValue(initial.end, initial.allDay) : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleAllDay = (checked) => {
    setAllDay(checked);
    // date and datetime-local inputs use different value formats, so clear them when switching
    setStart("");
    setEnd("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Add a title.");
    if (!start) return setError("Pick a start " + (allDay ? "date." : "date and time."));

    // `${date}T00:00` and datetime-local strings are parsed as local time
    const startDate = new Date(allDay ? `${start}T00:00` : start);
    let endDate = end ? new Date(allDay ? `${end}T23:59` : end) : null;
    if (allDay && !endDate) endDate = new Date(`${start}T23:59`);
    if (endDate && endDate < startDate) return setError("The end can't be before the start.");

    setBusy(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        allDay,
        ...(!initial && { recurring: false }), // keep the existing flag when editing
        start: startDate.toISOString(),
        ...(endDate && { end: endDate.toISOString() }),
      });
      onCancel(); // close the form
    } catch (err) {
      console.error(err);
      setError("Couldn't save the event. Please try again.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-6 flex flex-col gap-4 rounded-xl border border-crimson/40 bg-surface p-5">
      <h3 className="text-base font-semibold">{initial ? "Edit event" : "New event"}</h3>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} autoFocus />
      <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120} />
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" checked={allDay} onChange={(e) => toggleAllDay(e.target.checked)} className="size-4 accent-[var(--crimson)]" />
        All-day event
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Starts
          <input type={allDay ? "date" : "datetime-local"} value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Ends (optional)
          <input type={allDay ? "date" : "datetime-local"} value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
        </label>
      </div>
      <TextAreaField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} />
      {error && <FormAlert>{error}</FormAlert>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {initial ? "Save changes" : "Add event"}
        </Button>
      </div>
    </form>
  );
}

const PAGE_SIZE = 5;

export default function Schedule({ teamId, canManage = false }) {
  const [events, setEvents] = useState(null); // null = still loading
  const [showPast, setShowPast] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [view, setView] = useState("list"); // "list" | "calendar"
  const [form, setForm] = useState(null); // null | { event?: existing event } (no event = adding)
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!teamId) return;
    // "teams" must match the top-level collection that getTeam() reads from (see src/firestore/Teams.js).
    const q = query(collection(db, "teams", teamId, "events"), orderBy("start"));
    const unsub = onSnapshot(
      q,
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error("events listener failed:", err);
        setEvents([]);
      }
    );
    return unsub;
  }, [teamId]);

  // The onSnapshot listener above picks up adds and removes automatically.
  const addEvent = (data) => addDoc(collection(db, "teams", teamId, "events"), data);

  const updateEvent = (id, data) => {
    const { end, ...rest } = data;
    // deleteField() clears the end time if the admin removed it
    return updateDoc(doc(db, "teams", teamId, "events", id), { ...rest, end: end ?? deleteField() });
  };

  const removeEvent = async (ev) => {
    if (!window.confirm(`Remove "${ev.title}" from the schedule?`)) return;
    setActionError("");
    try {
      await deleteDoc(doc(db, "teams", teamId, "events", ev.id));
    } catch (err) {
      console.error(err);
      setActionError("Couldn't remove the event. Please try again.");
    }
  };
  const onRemove = canManage ? removeEvent : undefined;
  const onEdit = canManage ? (ev) => setForm({ event: ev }) : undefined;

  if (events === null) return <p className="text-muted">Loading schedule…</p>;

  const current = Date.now();
  const upcoming = events.filter((e) => new Date(e.end ?? e.start).getTime() >= current);
  const past = events.filter((e) => new Date(e.end ?? e.start).getTime() < current).reverse();

  const visibleUpcoming = upcoming.slice(0, visibleCount);
  const remaining = upcoming.length - visibleUpcoming.length;

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-line p-0.5" role="group" aria-label="Schedule view">
          {["list", "calendar"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize",
                view === v ? "bg-crimson text-white" : "text-muted hover:text-ink",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        {canManage && !form && (
          <Button onClick={() => setForm({})}>
            <Icon name="calendar" size={16} /> Add event
          </Button>
        )}
      </div>

      {form && (
        <EventForm
          key={form.event?.id ?? "new"}
          initial={form.event}
          onSave={form.event ? (data) => updateEvent(form.event.id, data) : addEvent}
          onCancel={() => setForm(null)}
        />
      )}
      {actionError && (
        <div className="mb-4">
          <FormAlert>{actionError}</FormAlert>
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-muted">No Planned Events</p>
      ) : view === "calendar" ? (
        <CalendarView events={events} onEdit={onEdit} onRemove={onRemove} />
      ) : (
        <>
          {upcoming.length ? (
            <>
              <ul className="flex flex-col gap-3">
                {visibleUpcoming.map((e) => (
                  <EventRow key={e.id ?? e.start} event={e} onEdit={onEdit} onRemove={onRemove} />
                ))}
              </ul>
              {remaining > 0 && (
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="mt-4 text-sm font-semibold text-crimson-ink hover:underline"
                >
                  View more ({Math.min(PAGE_SIZE, remaining)} more)
                </button>
              )}
            </>
          ) : (
            <p className="text-muted">No upcoming events.</p>
          )}
          {past.length > 0 && (
            <div className="mt-8">
              <button onClick={() => setShowPast((s) => !s)} className="text-sm font-semibold text-crimson-ink hover:underline" aria-expanded={showPast}>
                {showPast ? "Hide past events" : `Show ${past.length} past ${past.length === 1 ? "event" : "events"}`}
              </button>
              {showPast && (
                <ul className="mt-3 flex flex-col gap-3 opacity-75">
                  {past.map((e) => (
                    <EventRow key={e.id ?? e.start} event={e} onEdit={onEdit} onRemove={onRemove} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}