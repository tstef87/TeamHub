import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import markWhite from "../../../../assets/brand/sju-mark-white.png";
import Button from "../../../../components/ui/Button";
import { FormAlert, TextAreaField, TextField } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import { Avatar, EmptyState } from "../../../../components/ui/misc";
import { AnnouncementCard } from "../../../../components/team/TeamBits";
import { activityName } from "../../../../lib/activities";
import { cx } from "../../../../lib/format";
import { getTeam } from "../../../../firestore/Teams";
import Schedule from "../../../../components/team/Events";
import { useAuth } from "../../../../context/AuthContext";
import {
  getAnnouncements,
  postAnnouncement,
  setAnnouncementPinned,
  editAnnouncement,
  deleteAnnouncement
} from "../../../../firestore/Announcements";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

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
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [team, setTeam] = useState(null);
  const [tab, setTab] = useState("updates");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [pinUpdatingId, setPinUpdatingId] = useState(null);
  const [announcementActionId, setAnnouncementActionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getTeam(teamId)
      .then((t) => {
        if (cancelled) return;
        if (!t) {
          navigate("*", { replace: true });
          return;
        }
        setTeam(t);
        setFollowers(t.followers ?? 0);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId, navigate]);
  
  useEffect(() => {
    let cancelled = false;
    setAnnouncementsLoading(true);
    setAnnouncementsError("");

    getAnnouncements(teamId)
      .then((list) => {
        if (!cancelled) setAnnouncements(list);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setAnnouncementsError("Couldn't load announcements. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setAnnouncementsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);


  const handlePost = async ({ title, body }) => {
    await postAnnouncement(teamId, { title, body });
    const updated = await getAnnouncements(teamId);
    setAnnouncements(updated);
  };


const handleTogglePin = async (announcementId, pinned) => {
  // Prevent another pin operation while one is already running.
  if (pinUpdatingId !== null) return;

  setPinUpdatingId(announcementId);
  setAnnouncementsError("");

  try {
    await setAnnouncementPinned(teamId, announcementId, pinned);

    // Update the local list instead of downloading every announcement again.
    setAnnouncements((current) =>
      current
        .map((item) =>
          item.id === announcementId ? { ...item, pinned } : item
        )
        .sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            b.createdAt - a.createdAt
        )
    );
  } catch (err) {
    console.error(err);

    if (err.message === "PIN_LIMIT_REACHED") {
      setAnnouncementsError(
        "A team can only have three pinned announcements. Unpin another announcement first."
      );
    } else {
      setAnnouncementsError(
        "Couldn't update the announcement. Please try again."
      );
    }
  } finally {
    setPinUpdatingId(null);
  }
};


const handleEditAnnouncement = async (announcementId, fields) => {
  if (announcementActionId !== null) {
    throw new Error("Another announcement action is in progress.");
  }

  setAnnouncementActionId(announcementId);
  setAnnouncementsError("");

  try {
    await editAnnouncement(teamId, announcementId, fields);

    setAnnouncements((current) =>
      current.map((item) =>
        item.id === announcementId
          ? { ...item, title: fields.title.trim(), body: fields.body.trim() }
          : item
      )
    );
  } catch (err) {
    console.error(err);
    setAnnouncementsError("Couldn't edit the announcement. Please try again.");
    throw err;
  } finally {
    setAnnouncementActionId(null);
  }
};

const handleDeleteAnnouncement = async (announcementId) => {
  try {
    await deleteAnnouncement(teamId, announcementId);

    setAnnouncements((current) =>
      current.filter((item) => item.id !== announcementId)
    );
  } catch (err) {
    console.error(err);
    setAnnouncementsError(
      err.message === "NOT_ANNOUNCEMENT_AUTHOR"
        ? "You can only delete your own announcements."
        : "Couldn't delete the announcement. Please try again."
    );
  } finally {
    setAnnouncementActionId(null);
  }
};

  const toggleFollow = () => {
    setFollowers((n) => Math.max(0, n + (isFollowing ? -1 : 1)));
    setIsFollowing((f) => !f);
  };

  if (authLoading || loading) {
    return <p className="p-6 text-muted">Loading…</p>;
  }

  if (error) return <FormAlert>{error}</FormAlert>;
  if (!team) return null; // redirect in progress

  return (
    <>
      <Link
        to="/Teams"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
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
          {activityName(team.org_cat, team.org)}
          {team.org_cat === "club" ? " club" : ""}, Saint Joseph's University
        </p>

        <h1 className="relative mt-1 max-w-3xl font-serif text-[36px] leading-[1.1] font-semibold text-white sm:text-[52px]">
          {team.name}
        </h1>

        <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-sm text-white/80">
            <span className="font-semibold tabular-nums text-white">
              {team.followers ?? 0}
            </span>{" "}
            {team.followers === 1 ? "fan" : "fans"}
          </p>

          <button
            onClick={toggleFollow}
            aria-pressed={isFollowing}
            className={cx(
              "ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60",
              isFollowing
                ? "border border-white/40 text-white hover:bg-white/10"
                : "bg-white text-crimson hover:bg-white/90"
            )}
          >
            <Icon name={isFollowing ? "check" : "star"} size={16} />
            {isFollowing ? "Following" : "Follow team"}
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Team sections"
        className="mt-6 flex gap-1 overflow-x-auto border-b border-line"
      >
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
              tab === tb.id
                ? "border-crimson text-ink"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="pt-6"
      >
        {tab === "updates" && (
          <Updates
            announcements={announcements}
            announcementsLoading={announcementsLoading}
            announcementsError={announcementsError}
            pinUpdatingId={pinUpdatingId}
            announcementActionId={announcementActionId}
            canPost={Boolean(user)}
            currentUserId={user?.uid}
            onPost={handlePost}
            onTogglePin={handleTogglePin}
            onEdit={handleEditAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        )}

        {tab === "schedule" && (
          <Schedule
            teamId={teamId}
            canManage={Boolean(team.admins?.includes(user?.uid))}
          />
        )}

        {tab === "roster" && (
          <Roster roster={SAMPLE_ROSTER} me={{ uid: user?.uid }} />
        )}

        {tab === "about" && (
          <div className="max-w-prose">
            <h2 className="mb-2 text-xl font-semibold">About the team</h2>
            <p className="whitespace-pre-line text-ink/90">
              {team.description || "This team hasn't added a description yet."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}


function Updates({
  announcements,
  announcementsLoading,
  announcementsError,
  pinUpdatingId,
  announcementActionId,
  canPost,
  currentUserId,
  onPost,
  onTogglePin,
  onEdit,
  onDelete
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {announcementsError && (
        <FormAlert>{announcementsError}</FormAlert>
      )}

      {canPost && <Composer onPost={onPost} />}

      {announcementsLoading ? (
        <p className="text-muted">Loading announcements…</p>
      ) : announcements.length > 0 ? (
        announcements.map((a) => (
          <AnnouncementCard
            key={a.id}
            item={a}
            canPin={canPost}
            canEdit={currentUserId === a.authorId}
            canDelete={currentUserId === a.authorId}
            pinUpdating={pinUpdatingId === a.id}
            pinActionsDisabled={pinUpdatingId !== null || announcementActionId !== null}
            actionsDisabled={announcementActionId !== null}
            onTogglePin={() => onTogglePin(a.id, !a.pinned)}
            onEdit={(fields) => onEdit(a.id, fields)}
            onDelete={() => onDelete(a.id)}
          />
        ))
      ) : (
        <EmptyState icon="megaphone" title="No announcements yet">
          {canPost
            ? "Post the first update above."
            : "Team announcements will show up here."}
        </EmptyState>
      )}
    </div>
  );
}


function Composer({ onPost }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a message before posting.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await onPost({ title, body });

      setTitle("");
      setBody("");
      setOpen(false);
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
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-xl border border-crimson/40 bg-surface p-5"
    >
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        autoFocus
      />

      <TextAreaField
        label="Message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={4}
      />

      {error && <FormAlert>{error}</FormAlert>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={busy}
        >
          Cancel
        </Button>

        <Button type="submit" loading={busy}>
          Post announcement
        </Button>
      </div>
    </form>
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