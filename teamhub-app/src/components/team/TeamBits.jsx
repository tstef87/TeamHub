// Pieces shared by the team directory, team page and dashboard.
import { Link } from "react-router-dom";
import { activityName } from "../../lib/activities";
import { cx, eventDay, eventTime, relativeTime } from "../../lib/format";
import Icon from "../ui/Icon";
import { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import { FormAlert, TextAreaField, TextField } from "../ui/Field";

const FILLER = new Set(["sju", "club", "team", "the", "of", "and", "&", "saint", "joseph's", "st."]);

/** "SJU Club Ice Hockey" -> "IH", "Club Lacrosse" -> "LA". */
function teamInitials(name) {
  const words = name.split(/\s+/).filter((w) => w && !FILLER.has(w.toLowerCase()));
  const use = words.length ? words : name.split(/\s+/).filter(Boolean);
  if (use.length === 1) return use[0].slice(0, 2).toUpperCase();
  return (use[0][0] + use[use.length - 1][0]).toUpperCase();
}

/** Square crest with the team's initials — stands in until teams upload logos. */
export function TeamCrest({ name, size = 44, className }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-crimson font-serif font-semibold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {teamInitials(name)}
    </span>
  );
}

export function TeamRow({ team, following }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-crimson"
    >
      <TeamCrest name={team.name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold">
          <span className="truncate">{team.name}</span>
          {following && (
            <span className="shrink-0 rounded-full bg-crimson-soft px-2 py-0.5 text-xs font-semibold text-crimson-ink">
              Following
            </span>
          )}
        </p>
        <p className="truncate text-sm text-muted">
          {activityName(team.org_cat, team.org)}
          {team.org_cat === "club" ? " club" : ""}
        </p>
      </div>
      <div className="hidden text-right text-sm sm:block">
        <p className="font-semibold tabular-nums">{team.followers ?? 0}</p>
        {/* <p className="text-muted">{team.followers === 1 ? "fan" : "fans"}</p> */}
      </div>
      <Icon name="chevronRight" className="text-muted group-hover:text-crimson-ink" />
    </Link>
  );
}

/** One schedule item with a ticket-stub date block. */
export function EventItem({ event, teamName }) {
  const d = eventDay(event.start, event.allDay);
  return (
    <li className="flex overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center border-r border-dashed border-line bg-crimson-soft py-3 text-crimson-ink">
        <span className="text-xs font-semibold">{d.weekday}</span>
        <span className="font-serif text-[26px] leading-none font-semibold">{d.day}</span>
        <span className="text-xs font-medium">{d.month}</span>
      </div>
      <div className="min-w-0 flex-1 px-4 py-3">
        {teamName && <p className="text-xs font-semibold text-crimson-ink">{teamName}</p>}
        <p className="font-semibold">{event.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={14} />
            {eventTime(event.start, event.end, event.allDay)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mapPin" size={14} />
              {event.location}
            </span>
          )}
          {event.recurring && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="repeat" size={14} />
              Repeats
            </span>
          )}
        </div>
      </div>
    </li>
  );
}



export function AnnouncementCard({
  item,
  teamName,
  teamId,
  canPin,
  canEdit,
  canDelete,
  onTogglePin,
  onEdit,
  onDelete,
  pinUpdating = false,
  pinActionsDisabled = false,
  actionsDisabled = false,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
const deleteTimeout = useRef(null);

const cancelDelete = () => {
  setConfirmingDelete(false);

  if (deleteTimeout.current) {
    clearTimeout(deleteTimeout.current);
    deleteTimeout.current = null;
  }
};

useEffect(() => {
  if (!confirmingDelete) return;

  const handleOutsideClick = () => {
    cancelDelete();
  };

  document.addEventListener("click", handleOutsideClick);

  return () => {
    document.removeEventListener("click", handleOutsideClick);
  };
}, [confirmingDelete]);

useEffect(() => {
  return () => {
    if (deleteTimeout.current) {
      clearTimeout(deleteTimeout.current);
    }
  };
}, []);

  const startEditing = () => {
    setTitle(item.title);
    setBody(item.body);
    setEditError("");
    setEditing(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setEditError("A title and message are required.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      await onEdit({ title, body });
      setEditing(false);
    } catch (err) {
      setEditError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article
      className={cx(
        "rounded-xl border bg-surface p-5",
        item.pinned
          ? "border-gold/60 shadow-[inset_4px_0_0_var(--gold)]"
          : "border-line"
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {teamName && teamId && (
            <Link
              to={`/teams/${teamId}`}
              className="text-xs font-semibold text-crimson-ink hover:underline"
            >
              {teamName}
            </Link>
          )}

          <h3 className="font-sans text-[17px] font-semibold">
            {item.title}
          </h3>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {item.pinned && !canPin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold">
              <Icon name="pin" size={12} /> Pinned
            </span>
          )}

          {canPin && (
            <button
              type="button"
              onClick={onTogglePin}
              disabled={pinActionsDisabled || editing}
              className={cx(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                item.pinned
                  ? "bg-gold-soft text-gold hover:bg-gold/20"
                  : "text-muted hover:bg-surface-sunk",
                pinActionsDisabled && "cursor-not-allowed opacity-60"
              )}
              aria-pressed={item.pinned}
            >
              <Icon name="pin" size={12} />
              {pinUpdating
                ? "Updating..."
                : item.pinned
                  ? "Unpin"
                  : "Pin"}
            </button>
          )}

          {!editing && canEdit && (
            <button
              type="button"
              onClick={startEditing}
              disabled={actionsDisabled}
              className="rounded-full px-2 py-0.5 text-xs font-semibold text-muted hover:bg-surface-sunk hover:text-ink disabled:opacity-50"
            >
              Edit
            </button>
          )}

          {!editing && canDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();

                if (confirmingDelete) {
                  cancelDelete();
                  onDelete();
                  return;
                }

                setConfirmingDelete(true);

                deleteTimeout.current = setTimeout(() => {
                  setConfirmingDelete(false);
                  deleteTimeout.current = null;
                }, 3000);
              }}
              disabled={actionsDisabled}
              className={cx(
                "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                confirmingDelete
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "text-muted hover:bg-surface-sunk hover:text-red-600",
                actionsDisabled && "cursor-not-allowed opacity-60"
              )}
            >
              {confirmingDelete ? "Are you sure?" : "Delete"}
            </button>
          )}
        </div>
      </header>

      {editing ? (
        <form onSubmit={submitEdit} className="flex flex-col gap-3">
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />

          <TextAreaField
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={4}
          />

          {editError && <FormAlert>{editError}</FormAlert>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-line text-[15px] text-ink/90">
            {item.body}
          </p>

          <p className="mt-3 text-sm text-muted">
            {item.authorName}, {relativeTime(item.createdAt)}
            {item.editedAt && " · Edited"}
          </p>
        </>
      )}
    </article>
  );
}