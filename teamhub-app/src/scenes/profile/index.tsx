import { useNavigate } from "react-router-dom";
import seal from "../../assets/brand/sju-seal.png";
import Button from "../../components/ui/Button";
import { Avatar, PageHeader, RoleBadge, Spinner } from "../../components/ui/misc";
import { TeamRow } from "../../components/team/TeamBits";
import { useAuth } from "../../context/AuthContext";
import useAsync from "../../hooks/useAsync";
import { signOut } from "../../services/auth";
import { listTeams } from "../../services/teams";

export default function Profile() {
  const { profile, role, displayName, user } = useAuth();
  const navigate = useNavigate();
  const followed = profile?.followedTeams ?? [];
  const { data: teams, loading } = useAsync(
    async () => (await listTeams()).filter((t) => followed.includes(t.id)),
    [followed.join(",")],
  );

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" />

      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <img src={seal} alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 w-56 opacity-[0.07]" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar name={displayName || "?"} size={72} />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold">{displayName}</h2>
            <p className="text-muted">@{profile?.username}</p>
            <div className="mt-2">
              <RoleBadge role={role} />
            </div>
          </div>
        </div>
        <dl className="relative mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Email</dt>
            <dd className="font-medium">{profile?.email ?? user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Teams followed</dt>
            <dd className="font-medium tabular-nums">{followed.length}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Teams you follow</h2>
        {loading ? (
          <Spinner />
        ) : teams?.length ? (
          <ul className="flex flex-col gap-3">
            {teams.map((t) => (
              <li key={t.id}>
                <TeamRow team={t} following />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">You aren't following any teams yet.</p>
        )}
      </section>

      <div className="mt-10 border-t border-line pt-6">
        <Button
          variant="secondary"
          onClick={async () => {
            await signOut();
            navigate("/Login");
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
