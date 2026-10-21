import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import markWhite from "../../../../assets/brand/sju-mark-white.png";
import Button from "../../../../components/ui/Button";
import { FormAlert, TextAreaField, TextField } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import { Avatar, EmptyState } from "../../../../components/ui/misc";
import { AnnouncementCard, EventItem } from "../../../../components/team/TeamBits";
import { activityName } from "../../../../lib/activities";
import { cx } from "../../../../lib/format";

// TODO(backend): Remove all of the sample data below and load the real data instead.
// Original services and what each one did:
//   const { teamId } = useParams();                          // which team page this is
//   const { user, profile, role, displayName } = useAuth();   // who is signed in
//   getTeam(teamId)                                          // the team (name, description, org, followers)
//   followTeam(uid, teamId) / unfollowTeam(uid, teamId)      // follow button
//   getAnnouncements(teamId)                                 // Updates tab
//   postAnnouncement(teamId, { title, body, pinned, authorId, authorName })
//   setAnnouncementPinned(teamId, announcementId, pinned)    // pin toggle (reload if it fails)
//   getTeamEvents(teamId)                                    // Schedule tab
//   getRoster(teamId)                                        // Roster tab
//   openDirectConversation(me, other)                        // "Message" button, returns a conversation id
// Each tab loaded its own data with useAsync, so restore the <Spinner /> and the error <FormAlert />
// for loading and error states. Also restore the "Couldn't load this team" and "Team not found"
// screens at the top of <TeamPage />.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

const role = "coach"; // Change to "player" to hide the post and pin controls.
const me = { uid: "me", name: "Alex Johnson" };

const SAMPLE_TEAM = {
  id: "ice-hockey",
  name: "SJU Club Ice Hockey",
  description: "Club ice hockey at Saint Joseph's University.\nWe practice twice a week and play a regional schedule.",
  org_cat: "sport",
  org: "ice-hockey",
  followers: 42,
};

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Practice moved to 7 PM",
    body: "Ice time shifted this week. Bring both jerseys.",
    pinned: true,
    authorName: "Coach Rivera",
    createdAt: new Date(now - 3 * HOUR),
  },
  {
    id: "a2",
    title: "Spring schedule posted",
    body: "Check the schedule tab for home and away dates.",
    pinned: false,
    authorName: "Coach Rivera",
    createdAt: new Date(now - 2 * DAY),
  },
];

const SAMPLE_EVENTS = [
  {
    id: "e0",
    title: "Season opener",
    location: "Hawk Hill Rink",
    allDay: false,
    start: new Date(now - 7 * DAY).toISOString(),
    end: new Date(now - 7 * DAY + 2 * HOUR).toISOString(),
    recurring: false,
  },
  {
    id: "e1",
    title: "Home game vs. Villanova",
    location: "Hawk Hill Rink",
    allDay: false,
    start: new Date(now + 2 * DAY).toISOString(),
    end: new Date(now + 2 * DAY + 2 * HOUR).toISOString(),
    recurring: false,
  },
  {
    id: "e2",
    title: "Team practice",
    location: "Sweeney Field",
    allDay: false,
    start: new Date(now + 4 * DAY).toISOString(),
    end: new Date(now + 4 * DAY + 90 * 60 * 1000).toISOString(),
    recurring: true,
  },
];

const SAMPLE_ROSTER = [
  { id: "r1", uid: "u1", name: "Jordan Rivera", role: "coach", position: "Head Coach" },
  { id: "r2", uid: "me", name: "Alex Johnson", role: "player", number: 9, position: "Forward" },
  { id: "r3", uid: "u2", name: "Jamie Lee", role: "player", number: 4, position: "Defense" },
  { id: "r4", uid: null, name: "sam@sju.edu", role: "player" },
];

const TABS = [
  { id: "updates", label: "Updates" },
  { id: "schedule", label: "Schedule" },
  { id: "roster", label: "Roster" },
  { id: "about", label: "About" },
];

export default function TeamPage() {
  const [tab, setTab] = useState("updates");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(SAMPLE_TEAM.followers);
  const [announcements, setAnnouncements] = useState(SAMPLE_ANNOUNCEMENTS);
  // TODO(backend): Add `const [followBusy, setFollowBusy] = useState(false);` and disable the follow
  // button while it's saving.

  const t = { ...SAMPLE_TEAM, followers };

  // TODO(backend): Replace with followTeam(user.uid, t.id) / unfollowTeam(user.uid, t.id) inside a
  // try/catch, and read `isFollowing` from `profile.followedTeams.includes(teamId)` instead of state.
  const toggleFollow = () => {
    setFollowers((n) => Math.max(0, n + (isFollowing ? -1 : 1)));
    setIsFollowing((f) => !f);
  };

  // TODO(backend): Replace with postAnnouncement(teamId, { title, body, pinned, authorId, authorName })
  // and then reload the list from getAnnouncements(teamId).
  const handlePost = ({ title, body, pinned }) => {
    setAnnouncements((list) => [
      { id: `a${Date.now()}`, title: title.trim(), body: body.trim(), pinned, authorName: me.name, createdAt: new Date() },
      ...list,
    ]);
  };

  // TODO(backend): Replace with setAnnouncementPinned(teamId, id, pinned). Update the list right away,
  // and reload it from the server if the save fails.
  const handleTogglePin = (id, pinned) => {
    setAnnouncements((list) => list.map((a) => (a.id === id ? { ...a, pinned } : a)));
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
          <Updates
            announcements={announcements}
            canPost={role === "coach"}
            onPost={handlePost}
            onTogglePin={handleTogglePin}
          />
        )}
        {tab === "schedule" && <Schedule events={SAMPLE_EVENTS} />}
        {tab === "roster" && <Roster roster={SAMPLE_ROSTER} me={me} />}
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

function Updates({ announcements, canPost, onPost, onTogglePin }) {
  const sorted = [...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {canPost && <Composer onPost={onPost} />}
      {sorted.length ? (
        sorted.map((a) => (
          <AnnouncementCard key={a.id} item={a} canPin={canPost} onTogglePin={() => onTogglePin(a.id, !a.pinned)} />
        ))
      ) : (
        <EmptyState icon="megaphone" title="No announcements yet">
          {canPost ? "Post the first update above. Followers will see it on their home page." : "Coach updates will show up here."}
        </EmptyState>
      )}
    </div>
  );
}

function Composer({ onPost }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState("");
  // TODO(backend): Add `const [busy, setBusy] = useState(false);` and pass `loading={busy}` to the
  // "Post announcement" <Button>.

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a message before posting.");
      return;
    }
    setError("");
    // TODO(backend): Make this async and wrap the post in try/catch/finally:
    //   setBusy(true);
    //   try { await postAnnouncement(teamId, { title, body, pinned, authorId, authorName }); ... }
    //   catch (err) { setError("Couldn't post the announcement. Please try again."); }
    //   finally { setBusy(false); }
    onPost({ title, body, pinned });
    setTitle("");
    setBody("");
    setPinned(false);
    setOpen(false);
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
        <Button type="submit">Post announcement</Button>
      </div>
    </form>
  );
}

function Schedule({ events }) {
  const [showPast, setShowPast] = useState(false);

  const current = Date.now();
  const upcoming = events.filter((e) => new Date(e.end ?? e.start).getTime() >= current);
  const past = events.filter((e) => new Date(e.end ?? e.start).getTime() < current).reverse();

  if (!events.length)
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

function Roster({ roster, me: currentUser }) {
  const navigate = useNavigate();
  if (!roster.length)
    return (
      <EmptyState icon="teams" title="No roster yet">
        Players added by the coach will appear here.
      </EmptyState>
    );

  const coaches = roster.filter((r) => r.role === "coach");
  const players = roster.filter((r) => r.role !== "coach").sort((a, b) => Number(a.number ?? 999) - Number(b.number ?? 999));

  const message = () => {
    // TODO(backend): Find or create the conversation first, then open it:
    //   const id = await openDirectConversation(me, { uid: r.uid, name: r.name });
    //   navigate(`/Messages/${id}`);
    // (make this handler async and take the roster entry `r` as an argument).
    navigate("/Messages");
  };

  const group = (title, rows) =>
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
              {r.uid && r.uid !== currentUser.uid && (
                <Button variant="secondary" size="sm" onClick={message}>
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