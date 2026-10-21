// .ics upload — same parsing as the old CalendarUpload.jsx, restyled.
import { useState } from "react";
import ICAL from "ical.js";
import { eventTime } from "../../lib/format";
import { FormAlert } from "../ui/Field";
import Icon from "../ui/Icon";

const PREVIEW_COUNT = 5;

/** Turns the text of an .ics file into a plain array of events. */
// eslint-disable-next-line react-refresh/only-export-components
export function parseIcs(text) {
  const root = new ICAL.Component(ICAL.parse(text));
  return root.getAllSubcomponents("vevent").map((vevent) => {
    const e = new ICAL.Event(vevent);
    const allDay = e.startDate.isDate;
    return {
      uid: e.uid || null,
      title: e.summary || "(No title)",
      description: e.description || "",
      location: e.location || "",
      allDay,
      // ISO strings are safe to store in Firestore and easy to give to a calendar view.
      start: e.startDate.toJSDate().toISOString(),
      end: e.endDate ? e.endDate.toJSDate().toISOString() : null,
      // Only the first occurrence is included for repeating events.
      recurring: e.isRecurring(),
    };
  });
}

function formatDate(ev) {
  const d = new Date(ev.start);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", ...(ev.allDay ? { timeZone: "UTC" } : {}) });
}

export default function CalendarUpload({ onEventsParsed, onClear, maxSizeMB = 2 }) {
  const [fileName, setFileName] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;
    setError("");

    if (!file.name.toLowerCase().endsWith(".ics")) {
      setError("Choose an .ics calendar file.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is too large. The limit is ${maxSizeMB} MB.`);
      return;
    }
    try {
      const parsed = parseIcs(await file.text());
      if (!parsed.length) {
        setError("No events were found in that file.");
        return;
      }
      setFileName(file.name);
      setEvents(parsed);
      onEventsParsed?.(parsed, file);
    } catch (err) {
      console.error(err);
      setError("Couldn't read that file. Make sure it's a valid .ics export.");
    }
  };

  const clear = () => {
    setFileName("");
    setEvents([]);
    setError("");
    onClear?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Schedule</span>
      {!fileName ? (
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-line bg-surface px-4 py-6 text-center hover:border-crimson has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-crimson/40">
          <Icon name="upload" className="text-crimson-ink" />
          <span className="text-sm font-semibold">Upload a calendar file</span>
          <span className="text-[13px] text-muted">Export an .ics file from Google Calendar, Outlook, or Apple Calendar.</span>
          <input type="file" accept=".ics,text/calendar" onChange={handleFile} className="sr-only" />
        </label>
      ) : (
        <div className="rounded-xl border border-line bg-surface">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Icon name="calendar" className="text-crimson-ink" />
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-semibold">{fileName}</span>{" "}
              <span className="text-muted">
                ({events.length} {events.length === 1 ? "event" : "events"})
              </span>
            </p>
            <button type="button" onClick={clear} className="rounded-md p-1 text-muted hover:bg-surface-sunk hover:text-ink" aria-label="Remove calendar file">
              <Icon name="x" size={18} />
            </button>
          </div>
          <ul className="divide-y divide-line text-sm">
            {events.slice(0, PREVIEW_COUNT).map((ev, i) => (
              <li key={ev.uid ?? i} className="flex gap-3 px-4 py-2">
                <span className="w-14 shrink-0 font-semibold text-crimson-ink">{formatDate(ev)}</span>
                <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                <span className="hidden shrink-0 text-muted sm:inline">{eventTime(ev.start, ev.end, ev.allDay)}</span>
              </li>
            ))}
            {events.length > PREVIEW_COUNT && (
              <li className="px-4 py-2 text-muted">and {events.length - PREVIEW_COUNT} more</li>
            )}
          </ul>
        </div>
      )}
      {error && <FormAlert>{error}</FormAlert>}
    </div>
  );
}