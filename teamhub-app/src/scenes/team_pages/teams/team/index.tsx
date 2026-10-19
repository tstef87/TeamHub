import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import markWhite from "../../../../assets/brand/sju-mark-white.png";
import Button from "../../../../components/ui/Button";
import { FormAlert, TextAreaField, TextField } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import { Avatar, EmptyState, Spinner } from "../../../../components/ui/misc";
import { AnnouncementCard, EventItem } from "../../../../components/team/TeamBits";
import { useAuth } from "../../../../context/AuthContext";
import useAsync from "../../../../hooks/useAsync";
import { activityName } from "../../../../lib/activities";
import { cx } from "../../../../lib/format";
import { openDirectConversation } from "../../../../services/messages";
import {
  followTeam,
  getAnnouncements,
  getRoster,
  getTeam,
  getTeamEvents,
  postAnnouncement,
  setAnnouncementPinned,
  unfollowTeam,
} from "../../../../services/teams";
import type { RosterEntry } from "../../../../types";

const TABS = [
  { id: "updates", label: "Updates" },
  { id: "schedule", label: "Schedule" },
  { id: "roster", label: "Roster" },
  { id: "about", label: "About" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function TeamPage() {
  const { teamId = "" } = useParams();
  const { user, profile, role, displayName } = useAuth();
  const [tab, setTab] = useState<Tab>("updates");
  const [followBusy, setFollowBusy] = useState(false);

  const team = useAsync(() => getTeam(teamId), [teamId]);
  const isFollowing = (profile?.followedTeams ?? []).includes(teamId);

  if (team.loading) return <Spinner />;
  if (team.error)
    return (
      <EmptyState icon="x" title="Couldn't load this team">
        {team.error}
      </EmptyState>
    );
  if (!team.data)
    return (
      <EmptyState icon="search" title="Team not found" action={<Link to="/Teams" className="font-semibold text-crimson-ink">Back to teams</Link>}>
        It may have been renamed or removed.
      </EmptyState>
    );

  const t = team.data;

  const toggleFollow = async () => {
    if (!user) return;
    setFollowBusy(true);
    try {
      if (isFollowing) await unfollowTeam(user.uid, t.id);
      else await followTeam(user.uid, t.id);
      team.setData({ ...t, followers: Math.max(0, (t.followers ?? 0) + (isFollowing ? -1 : 1)) });
    } catch (e) {
      console.error(e);
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <>
      <Link to="/Teams" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <Icon name="arrowLeft" size={16} /> All teams
      </Link>

      {/* Team banner */}
      <section className="relative overflow-hidden rounded-2xl bg-crimson-deep px-6 pb-6 pt-10 text-white sm:px-10 sm:pt-14">
        <img
          src={markWhite}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 w-56 opacity-[0.06] sm:w-72"
        />
        <p className="relative text-sm font-medium text-white/70">
          {activityName(t.org_cat, t.org)}
          {t.org_cat === "club" ? " club" : ""}, Saint Joseph's University
        </p>
        <h1 className="relative mt-1 max-w-3xl font-serif text-[36px] leading-[1.1] font-semibold text-white sm:text-[52px]">
          {t.name}
        </h1>
        <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-sm text-white/80">
            <span className="font-semibold tabular-nums text-white">{t.followers ?? 0}</span> {t.followers === 1 ? "fan" : "fans"}
          </p>
          <button
            onClick={toggleFollow}
            disabled={followBusy}
            aria-pressed={isFollowing}
            className={cx(
              "ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60",
              isFollowing ? "border border-white/40 text-white hover:bg-white/10" : "bg-white text-crimson hover:bg-white/90",
            )}
          >
            <Icon name={isFollowing ? "check" : "star"} size={16} />
            {isFollowing ? "Following" : "Follow team"}
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div role="tablist" aria-label="Team sections" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            id={`tab-${tb.id}`}
            aria-selected={tab === tb.id}
            aria-controls={`panel-${tb.id}`}
            onClick={() => setTab(tb.id)}
            className={cx(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-[15px] font-medium",
              tab === tb.id ? "border-crimson text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-6">
        {tab === "updates" && (
          <Updates teamId={t.id} canPost={role === "coach"} author={{ uid: user?.uid ?? "", name: displayName }} />
        )}
        {tab === "schedule" && <Schedule teamId={t.id} />}
        {tab === "roster" && <Roster teamId={t.id} me={{ uid: user?.uid ?? "", name: displayName }} />}
        {tab === "about" && (
          <div className="max-w-prose">
            <h2 className="mb-2 text-xl font-semibold">About the team</h2>
            <p className="whitespace-pre-line text-ink/90">{t.description || "This team hasn't added a description yet."}</p>
          </div>
        )}
      </div>
    </>
  );
}

function Updates({ teamId, canPost, author }: { teamId: string; canPost: boolean; author: { uid: string; name: string } }) {
  const { data, loading, error, reload, setData } = useAsync(() => getAnnouncements(teamId), [teamId]);
  const sorted = [...(data ?? [])].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const togglePin = async (id: string, pinned: boolean) => {
    setData((data ?? []).map((a) => (a.id === id ? { ...a, pinned } : a)));
    try {
      await setAnnouncementPinned(teamId, id, pinned);
    } catch (e) {
      console.error(e);
      reload();
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {canPost && <Composer teamId={teamId} author={author} onPosted={reload} />}
      {loading ? (
        <Spinner />
      ) : error ? (
        <FormAlert>{error}</FormAlert>
      ) : sorted.length ? (
        sorted.map((a) => (
          <AnnouncementCard key={a.id} item={a} canPin={canPost} onTogglePin={() => togglePin(a.id, !a.pinned)} />
        ))
      ) : (
        <EmptyState icon="megaphone" title="No announcements yet">
          {canPost ? "Post the first update above. Followers will see it on their home page." : "Coach updates will show up here."}
        </EmptyState>
      )}
    </div>
  );
}

function Composer({ teamId, author, onPosted }: { teamId: string; author: { uid: string; name: string }; onPosted: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a message before posting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await postAnnouncement(teamId, { title, body, pinned, authorId: author.uid, authorName: author.name });
      setTitle("");
      setBody("");
      setPinned(false);
      setOpen(false);
      onPosted();
    } catch (err) {
      console.error(err);
      setError("Couldn't post the announcement. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-left text-muted hover:border-crimson"
      >
        <Icon name="megaphone" className="text-crimson-ink" />
        Post an announcement to the team
      </button>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-crimson/40 bg-surface p-5">
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} autoFocus />
      <TextAreaField label="Message" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={4} />
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-4 accent-[var(--crimson)]" />
        Pin to the top of the team feed
      </label>
      {error && <FormAlert>{error}</FormAlert>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Post announcement
        </Button>
      </div>
    </form>
  );
}

function Schedule({ teamId }: { teamId: string }) {
  const { data, loading, error } = useAsync(() => getTeamEvents(teamId), [teamId]);
  const [showPast, setShowPast] = useState(false);
  if (loading) return <Spinner />;
  if (error) return <FormAlert>{error}</FormAlert>;

  const now = Date.now();
  const all = data ?? [];
  const upcoming = all.filter((e) => new Date(e.end ?? e.start).getTime() >= now);
  const past = all.filter((e) => new Date(e.end ?? e.start).getTime() < now).reverse();

  if (!all.length)
    return (
      <EmptyState icon="calendar" title="No schedule yet">
        Coaches can add games and practices by uploading a calendar file when they create the team.
      </EmptyState>
    );

  return (
    <div className="max-w-3xl">
      {upcoming.length ? (
        <ul className="flex flex-col gap-3">
          {upcoming.map((e) => (
            <EventItem key={e.id ?? e.start} event={e} />
          ))}
        </ul>
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
                <EventItem key={e.id ?? e.start} event={e} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Roster({ teamId, me }: { teamId: string; me: { uid: string; name: string } }) {
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => getRoster(teamId), [teamId]);
  if (loading) return <Spinner />;
  if (error) return <FormAlert>{error}</FormAlert>;
  const list = data ?? [];
  if (!list.length)
    return (
      <EmptyState icon="teams" title="No roster yet">
        Players added by the coach will appear here.
      </EmptyState>
    );

  const coaches = list.filter((r) => r.role === "coach");
  const players = list.filter((r) => r.role !== "coach").sort((a, b) => Number(a.number ?? 999) - Number(b.number ?? 999));

  const message = async (r: RosterEntry) => {
    if (!r.uid) return;
    const id = await openDirectConversation(me, { uid: r.uid, name: r.name });
    navigate(`/Messages/${id}`);
  };

  const group = (title: string, rows: RosterEntry[]) =>
    rows.length ? (
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">{title}</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-8 text-center font-serif text-lg font-semibold tabular-nums text-crimson-ink">{r.number ?? ""}</span>
              <Avatar name={r.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="truncate text-sm text-muted">{r.position ?? (r.role === "coach" ? "Coach" : "Player")}</p>
              </div>
              {r.uid && r.uid !== me.uid && (
                <Button variant="secondary" size="sm" onClick={() => message(r)}>
                  <Icon name="message" size={16} /> Message
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <div className="max-w-3xl">
      {group("Coaches", coaches)}
      {group("Players", players)}
    </div>
  );
}
