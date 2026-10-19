import { Link } from "react-router-dom";
import { ButtonLink } from "../../components/ui/Button";
import { EmptyState, Spinner } from "../../components/ui/misc";
import { AnnouncementCard, EventItem, TeamCrest } from "../../components/team/TeamBits";
import { useAuth } from "../../context/AuthContext";
import useAsync from "../../hooks/useAsync";
import { getAnnouncements, getTeamEvents, listTeams } from "../../services/teams";

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { profile, role } = useAuth();
  const followed = profile?.followedTeams ?? [];

  const { data, loading, error } = useAsync(async () => {
    const teams = (await listTeams()).filter((t) => followed.includes(t.id));
    const perTeam = await Promise.all(
      teams.map(async (t) => {
        const [announcements, events] = await Promise.all([getAnnouncements(t.id), getTeamEvents(t.id)]);
        return { team: t, announcements, events };
      }),
    );
    const now = Date.now();
    const feed = perTeam
      .flatMap(({ team, announcements }) => announcements.map((a) => ({ ...a, team })))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(0, 8);
    const upcoming = perTeam
      .flatMap(({ team, events }) => events.map((e) => ({ ...e, team })))
      .filter((e) => new Date(e.end ?? e.start).getTime() >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 5);
    return { teams, feed, upcoming };
  }, [followed.join(",")]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[30px] font-semibold sm:text-[34px]">
          {greeting()}
          {profile?.firstName ? `, ${profile.firstName}` : ""}
        </h1>
        <p className="mt-1 text-muted">Here's what's happening with the teams you follow.</p>
      </header>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="x" title="Couldn't load your dashboard">
          {error}
        </EmptyState>
      ) : !data?.teams.length ? (
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
