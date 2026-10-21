import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cx } from "../../lib/format";
import Icon from "../ui/Icon";
import { Avatar, RoleBadge, SjuMark, Wordmark } from "../ui/misc";

const NAV = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/Teams", label: "Teams", icon: "teams" },
  { to: "/Messages", label: "Messages", icon: "message" },
  { to: "/Profile", label: "Profile", icon: "user" },
];

// TODO(backend): Remove these placeholders and read the real user from the auth
// context instead, e.g. `const { displayName, role } = useAuth();`
const displayName = "Your Name";
const role = "player";

// TODO(backend): Add a `RequireAuth` wrapper here (or in the router) that reads
// `{ user, loading }` from the auth context, shows <Spinner /> while loading,
// and redirects signed-out visitors to "/Login" with `state={{ from: location.pathname }}`
// before rendering <AppShell />.

export default function AppShell() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // TODO(backend): Call the sign-out service first, e.g. `await signOut();`
    // (make this function async), then navigate to the login page.
    navigate("/Login");
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-crimson-deep text-white lg:flex">
        <div className="px-6 pb-8 pt-7">
          <Wordmark tone="white" />
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-gold" />}
                  <Icon name={item.icon} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={displayName || "?"} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <div className="mt-0.5 [&>span]:bg-white/10 [&>span]:text-white/80">
                <RoleBadge role={role} />
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-crimson-deep px-4 text-white lg:hidden">
        <span className="flex items-center gap-2.5">
          <SjuMark tone="white" className="w-6" />
          <span className="font-serif text-lg font-semibold">TeamHub</span>
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10"
          aria-label="Sign out"
        >
          <Icon name="logout" size={18} />
        </button>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                isActive ? "text-crimson-ink" : "text-muted",
              )
            }
          >
            <Icon name={item.icon} size={22} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}