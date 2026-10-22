import { Link } from "react-router-dom";
import { ButtonLink } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/misc";
import { AnnouncementCard, EventItem, TeamCrest } from "../../components/team/TeamBits";

// TODO(backend): Remove all of the sample data below and load the real data instead.
// Original flow (using useAuth, useAsync and services/teams):
//   const { profile, role } = useAuth();
//   const followed = profile?.followedTeams ?? [];
//   const { data, loading, error } = useAsync(async () => {
//     1. teams = (await listTeams()).filter((t) => followed.includes(t.id));
//     2. For each team, fetch getAnnouncements(team.id) and getTeamEvents(team.id).
//     3. feed = all announcements, pinned first, then newest first, limited to 8.
//     4. upcoming = all events that haven't ended yet, soonest first, limited to 5.
//     return { teams, feed, upcoming };
//   }, [followed.join(",")]);

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

const profile = { firstName: "Alex" };
const role = "player";

const SAMPLE_TEAMS = [
  { id: "ice-hockey", name: "SJU Club Ice Hockey" },
  { id: "lacrosse", name: "SJU Club Lacrosse" },
];

const SAMPLE_FEED = [
  {
    id: "a1",
    title: "Practice moved to 7 PM",
    body: "Ice time shifted this week. Bring both jerseys.",
    pinned: true,
    authorName: "Coach Rivera",
    createdAt: new Date(now - 3 * HOUR),
    team: SAMPLE_TEAMS[0],
  },
  {
    id: "a2",
    title: "Spring schedule posted",
    body: "Check the schedule tab for home and away dates.",
    pinned: false,
    authorName: "Coach Miller",
    createdAt: new Date(now - 2 * DAY),
    team: SAMPLE_TEAMS[1],
  },
];

const SAMPLE_UPCOMING = [
  {
    id: "e1",
    title: "Home game vs. Villanova",
    location: "Hawk Hill Rink",
    allDay: false,
    start: new Date(now + 2 * DAY).toISOString(),
    end: new Date(now + 2 * DAY + 2 * HOUR).toISOString(),
    recurring: false,
    team: SAMPLE_TEAMS[0],
  },
  {
    id: "e2",
    title: "Team practice",
    location: "Sweeney Field",
    allDay: false,
    start: new Date(now + 4 * DAY).toISOString(),
    end: new Date(now + 4 * DAY + 90 * 60 * 1000).toISOString(),
    recurring: true,
    team: SAMPLE_TEAMS[1],
  },
];

const data = { teams: SAMPLE_TEAMS, feed: SAMPLE_FEED, upcoming: SAMPLE_UPCOMING };

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  // TODO(backend): Restore the loading and error states once data is fetched asynchronously:
  //   loading -> <Spinner /> (import from ui/misc)
  //   error   -> <EmptyState icon="x" title="Couldn't load your dashboard">{error}</EmptyState>

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold sm:text-[34px]">
          {greeting()}
          {profile?.firstName ? `, ${profile.firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted">Here's what's happening with the teams you follow.</p>
      </header>

      {!data.teams.length ? (
        <EmptyState
          icon="teams"
          title="You're not following any teams yet"
          action={<ButtonLink to="/Teams">Browse teams</ButtonLink>}
        >
          Follow a team to see its announcements and schedule here.
        </EmptyState>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-labelledby="feed-h">
            <h2 id="feed-h" className="mb-4 text-xl font-semibold">
              Latest updates
            </h2>
            {data.feed.length ? (
              <div className="flex flex-col gap-4">
                {data.feed.map((a) => (
                  <AnnouncementCard key={`${a.team.id}-${a.id}`} item={a} teamName={a.team.name} teamId={a.team.id} />
                ))}
              </div>
            ) : (
              <EmptyState icon="megaphone" title="No announcements yet">
                {role === "coach" ? "Open one of your teams to post the first update." : "Updates from coaches will show up here."}
              </EmptyState>
            )}
          </section>

          <aside className="flex flex-col gap-8">
            <section aria-labelledby="up-h">
              <h2 id="up-h" className="mb-4 text-xl font-semibold">
                Coming up
              </h2>
              {data.upcoming.length ? (
                <ul className="flex flex-col gap-3">
                  {data.upcoming.map((e) => (
                    <EventItem key={`${e.team.id}-${e.id}`} event={e} teamName={e.team.name} />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Nothing on the schedule yet.</p>
              )}
            </section>

            <section aria-labelledby="yt-h">
              <h2 id="yt-h" className="mb-3 text-xl font-semibold">
                Your teams
              </h2>
              <ul className="flex flex-col">
                {data.teams.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/teams/${t.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface"
                    >
                      <TeamCrest name={t.name} size={32} />
                      <span className="truncate font-medium">{t.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/Teams" className="mt-2 inline-block px-2 text-sm font-semibold text-crimson-ink hover:underline">
                Find more teams
              </Link>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}