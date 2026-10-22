import { useId, useState } from "react";
import { cx } from "../../lib/format";
import Icon from "./Icon";

export const inputClass = (invalid) =>
  cx(
    "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70",
    "transition-colors focus:outline-none focus:ring-2 focus:ring-crimson/25",
    invalid ? "border-danger focus:border-danger" : "border-line focus:border-crimson",
  );

function FieldShell({ id, label, hint, error, className, children }) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, hint, error, wrapperClassName, id, ...rest }) {
  const autoId = useId();
  const fid = id ?? autoId;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} className={wrapperClassName}>
      <input
        id={fid}
        className={inputClass(Boolean(error))}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? `${fid}-msg` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export function PasswordField({ label, hint, error, wrapperClassName, id, ...rest }) {
  const autoId = useId();
  const fid = id ?? autoId;
  const [show, setShow] = useState(false);
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className="relative">
        <input
          id={fid}
          type={show ? "text" : "password"}
          className={cx(inputClass(Boolean(error)), "pr-11")}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-ink"
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          <Icon name={show ? "eyeOff" : "eye"} size={18} />
        </button>
      </div>
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, wrapperClassName, id, ...rest }) {
  const autoId = useId();
  const fid = id ?? autoId;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} className={wrapperClassName}>
      <textarea
        id={fid}
        className={cx(inputClass(Boolean(error)), "min-h-24 resize-y")}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? `${fid}-msg` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export function FormAlert({ tone = "error", children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg border px-3.5 py-2.5 text-sm",
        tone === "error"
          ? "border-danger/30 bg-danger/8 text-danger"
          : "border-success/30 bg-success/8 text-success",
      )}
    >
      {children}
    </div>
  );
}