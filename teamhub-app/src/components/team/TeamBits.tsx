// Pieces shared by the team directory, team page and dashboard.
import { Link } from "react-router-dom";
import { activityName } from "../../lib/activities";
import { cx, eventDay, eventTime, relativeTime } from "../../lib/format";
import type { Announcement, Team, TeamEvent } from "../../types";
import Icon from "../ui/Icon";

const FILLER = new Set(["sju", "club", "team", "the", "of", "and", "&", "saint", "joseph's", "st."]);

/** "SJU Club Ice Hockey" -> "IH", "Club Lacrosse" -> "LA". */
function teamInitials(name: string) {
  const words = name.split(/\s+/).filter((w) => w && !FILLER.has(w.toLowerCase()));
  const use = words.length ? words : name.split(/\s+/).filter(Boolean);
  if (use.length === 1) return use[0].slice(0, 2).toUpperCase();
  return (use[0][0] + use[use.length - 1][0]).toUpperCase();
}

/** Square crest with the team's initials — stands in until teams upload logos. */
export function TeamCrest({ name, size = 44, className }: { name: string; size?: number; className?: string }) {
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

export function TeamRow({ team, following }: { team: Team; following?: boolean }) {
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
        <p className="text-muted">{team.followers === 1 ? "fan" : "fans"}</p>
      </div>
      <Icon name="chevronRight" className="text-muted group-hover:text-crimson-ink" />
    </Link>
  );
}

/** One schedule item with a ticket-stub date block. */
export function EventItem({ event, teamName }: { event: TeamEvent; teamName?: string }) {
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
  onTogglePin,
}: {
  item: Announcement;
  teamName?: string;
  teamId?: string;
  canPin?: boolean;
  onTogglePin?: () => void;
}) {
  return (
    <article
      className={cx(
        "rounded-xl border bg-surface p-5",
        item.pinned ? "border-gold/60 shadow-[inset_4px_0_0_var(--gold)]" : "border-line",
      )}
    >
      <header className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {teamName && teamId && (
            <Link to={`/teams/${teamId}`} className="text-xs font-semibold text-crimson-ink hover:underline">
              {teamName}
            </Link>
          )}
          <h3 className="font-sans text-[17px] font-semibold">{item.title}</h3>
        </div>
        {item.pinned && !canPin && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold">
            <Icon name="pin" size={12} /> Pinned
          </span>
        )}
        {canPin && (
          <button
            onClick={onTogglePin}
            className={cx(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              item.pinned ? "bg-gold-soft text-gold" : "text-muted hover:bg-surface-sunk",
            )}
            aria-pressed={item.pinned}
          >
            <Icon name="pin" size={12} /> {item.pinned ? "Pinned" : "Pin"}
          </button>
        )}
      </header>
      <p className="whitespace-pre-line text-[15px] text-ink/90">{item.body}</p>
      <p className="mt-3 text-sm text-muted">
        {item.authorName}, {relativeTime(item.createdAt)}
      </p>
    </article>
  );
}
