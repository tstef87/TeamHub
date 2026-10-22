// Small display helpers shared across pages.

/** Firestore Timestamps, Dates and ISO strings all become a Date (or null). */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && "toDate" in value) {
    return value.toDate();
  }
  return null;
}

export function fullName(p) {
  if (!p) return "";
  return [p.firstName, p.lastName].filter(Boolean).join(" ");
}

export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function relativeTime(date, now = new Date()) {
  if (!date) return "";
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function eventDay(iso, allDay) {
  const d = new Date(iso);
  const opts = allDay ? { timeZone: "UTC" } : {};
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short", ...opts }),
    month: d.toLocaleDateString(undefined, { month: "short", ...opts }),
    day: d.toLocaleDateString(undefined, { day: "numeric", ...opts }),
  };
}

export function eventTime(iso, end, allDay) {
  if (allDay) return "All day";
  const fmt = (s) =>
    new Date(s).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return end ? `${fmt(iso)} – ${fmt(end)}` : fmt(iso);
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}