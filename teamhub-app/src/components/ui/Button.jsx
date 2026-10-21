import { Link } from "react-router-dom";
import { cx } from "../../lib/format";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 select-none";

const variants = {
  primary: "bg-crimson text-white hover:bg-crimson-strong",
  secondary: "border border-line bg-surface text-ink hover:border-crimson hover:text-crimson-ink",
  ghost: "text-muted hover:bg-surface-sunk hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClass(variant = "primary", size = "md", extra) {
  return cx(base, variants[variant], sizes[size], extra);
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...rest
}) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}