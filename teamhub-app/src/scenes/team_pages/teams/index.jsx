import { useMemo, useState } from "react";
import { ButtonLink } from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { EmptyState, PageHeader } from "../../../components/ui/misc";
import { TeamRow } from "../../../components/team/TeamBits";
import { activityName } from "../../../lib/activities";
import { cx } from "../../../lib/format";

// TODO(backend): Remove the sample data below and load the real values instead.
// Original flow (using useAuth, useAsync and services/teams):
//   const { profile, role } = useAuth();
//   const { data: teams, loading, error } = useAsync(listTeams, []);
//   const followed = useMemo(() => new Set(profile?.followedTeams ?? []), [profile]);
// Also restore the loading and error states in the list area:
//   loading -> <Spinner /> (import from ui/misc)
//   error   -> <EmptyState icon="x" title="Couldn't load teams">{error}</EmptyState>
const role = "player"; // Change to "coach" to preview the "Create team" button.

const teams = [
  { id: "ice-hockey", name: "SJU Club Ice Hockey", org_cat: "sport", org: "ice-hockey", followers: 42 },
  { id: "lacrosse", name: "SJU Club Lacrosse", org_cat: "sport", org: "lacrosse", followers: 1 },
  { id: "film", name: "SJU Film Society", org_cat: "club", org: "film", followers: 18 },
  { id: "robotics", name: "SJU Robotics", org_cat: "club", org: "engineering-robotics", followers: 0 },
];

const followed = new Set(["ice-hockey", "film"]);

const FILTERS = [
  { id: "all", label: "All" },
  { id: "sport", label: "Sports" },
  { id: "club", label: "Clubs" },
  { id: "following", label: "Following" },
];

export default function Teams() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return teams
      .filter((t) => {
        if (filter === "following") return followed.has(t.id);
        if (filter === "sport" || filter === "club") return t.org_cat === filter;
        return true;
      })
      .filter(
        (t) =>
          !term ||
          t.name.toLowerCase().includes(term) ||
          activityName(t.org_cat, t.org).toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, filter]);

  return (
    <>
      <PageHeader
        title="Teams"
        description="Find an SJU club team and follow it to get its updates."
        actions={
          role === "coach" && (
            <ButtonLink to="/Teams/Create-Team">
              <Icon name="plus" size={18} /> Create team
            </ButtonLink>
          )
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search teams</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team or sport"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-3.5 text-[15px] focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/25"
          />
        </label>
        <div role="tablist" aria-label="Filter teams" className="flex gap-1 rounded-lg bg-surface-sunk p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                filter === f.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length ? (
        <ul className="flex flex-col gap-3">
          {visible.map((t) => (
            <li key={t.id}>
              <TeamRow team={t} following={followed.has(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="search" title={filter === "following" ? "You're not following any teams" : "No teams match"}>
          {filter === "following" ? "Open a team and choose Follow to add it here." : "Try a different name or sport."}
        </EmptyState>
      )}
    </>
  );
}