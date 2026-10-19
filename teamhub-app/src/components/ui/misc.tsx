// Small shared pieces: brand mark, avatar, spinner, empty state, role badge.
import type { ReactNode } from "react";
import markCrimson from "../../assets/brand/sju-mark-crimson.png";
import markWhite from "../../assets/brand/sju-mark-white.png";
import { cx, initials } from "../../lib/format";
import type { Role } from "../../types";
import Icon, { type IconName } from "./Icon";

export function SjuMark({ tone = "crimson", className }: { tone?: "crimson" | "white"; className?: string }) {
  return (
    <img
      src={tone === "white" ? markWhite : markCrimson}
      alt="Saint Joseph's University"
      className={cx("h-auto select-none", className)}
      draggable={false}
    />
  );
}

/** "TeamHub" lockup beside the SJU mark. */
export function Wordmark({ tone = "crimson" }: { tone?: "crimson" | "white" }) {
  return (
    <span className="flex items-center gap-3">
      <SjuMark tone={tone} className="w-9" />
      <span
        className={cx(
          "border-l pl-3 font-serif text-[22px] font-semibold leading-none",
          tone === "white" ? "border-white/30 text-white" : "border-line text-ink",
        )}
      >
        TeamHub
      </span>
    </span>
  );
}

// Deterministic pastel-on-crimson avatar colors so people are recognisable.
const avatarTones = [
  "bg-crimson text-white",
  "bg-crimson-soft text-crimson-ink",
  "bg-gold-soft text-gold",
  "bg-surface-sunk text-ink",
];

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const tone = avatarTones[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", tone, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex justify-center py-16" role="status">
      <span className="size-7 animate-spin rounded-full border-[3px] border-crimson border-r-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-crimson-soft text-crimson-ink">
        <Icon name={icon} />
      </span>
      <h3 className="font-sans text-base font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const roleLabel: Record<Role, string> = { coach: "Coach", player: "Player", follower: "Fan" };

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        role === "coach" && "bg-gold-soft text-gold",
        role === "player" && "bg-crimson-soft text-crimson-ink",
        role === "follower" && "bg-surface-sunk text-muted",
      )}
    >
      {roleLabel[role]}
    </span>
  );
}

export { roleLabel };

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
