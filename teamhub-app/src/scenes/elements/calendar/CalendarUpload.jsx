import { useState } from "react";
import ICAL from "ical.js";
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EventIcon from "@mui/icons-material/Event";

const PREVIEW_COUNT = 5;

// Turns the text of an .ics file into a plain array of events.
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

function formatWhen(ev) {
  const start = new Date(ev.start);
  return ev.allDay
    ? start.toLocaleDateString(undefined, { dateStyle: "medium", timeZone: "UTC" })
    : start.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CalendarUpload({
  onEventsParsed,
  onClear,
  label = "Upload calendar",
  maxSizeMB = 2,
}) {
  const [fileName, setFileName] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    
    // lets the same file be picked again
    e.target.value = ""; 
    if (!file) return;

    setError("");

    if (!file.name.toLowerCase().endsWith(".ics")) {
      setError("Please choose an .ics calendar file.");
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

  const handleClear = () => {
    setFileName("");
    setEvents([]);
    setError("");
    onClear?.();
  };

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
        >
          {fileName ? "Replace calendar" : label}
          <input
            type="file"
            hidden
            accept=".ics,text/calendar"
            onChange={handleFile}
          />
        </Button>

        {fileName && (
          <Chip
            icon={<EventIcon />}
            label={`${fileName} · ${events.length} event${events.length === 1 ? "" : "s"}`}
            onDelete={handleClear}
            size="small"
          />
        )}
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        Export an .ics file from Google Calendar, Outlook, or Apple Calendar.
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {events.length > 0 && (
        <List dense disablePadding>
          {events.slice(0, PREVIEW_COUNT).map((ev, i) => (
            <ListItem key={ev.uid ?? i} disableGutters>
              <ListItemText
                primary={ev.title}
                secondary={
                  formatWhen(ev) +
                  (ev.location ? ` · ${ev.location}` : "") +
                  (ev.recurring ? " · repeats" : "")
                }
              />
            </ListItem>
          ))}
          {events.length > PREVIEW_COUNT && (
            <ListItem disableGutters>
              <ListItemText
                secondary={`+ ${events.length - PREVIEW_COUNT} more`}
              />
            </ListItem>
          )}
        </List>
      )}
    </Stack>
  );
}
