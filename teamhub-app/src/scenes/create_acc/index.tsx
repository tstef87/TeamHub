import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { FormAlert, PasswordField, TextField } from "../../components/ui/Field";
import { cx } from "../../lib/format";
import { authErrorMessage, createAccount, isSjuEmail, normalizeEmail, usernameTaken } from "../../services/auth";

type Field = "firstName" | "lastName" | "email" | "username" | "password" | "confirmPassword" | "form";
type Errors = Partial<Record<Field, string>>;

const ROLE_OPTIONS = [
  { value: "player", title: "Player", detail: "I'm on a team roster" },
  { value: "follower", title: "Fan", detail: "I want to follow teams" },
] as const;

export default function CreateAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState<"player" | "follower">("follower");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const email = normalizeEmail(form.email);
    const username = form.username.trim().toLowerCase();
    const next: Errors = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!email) next.email = "Email is required.";
    else if (!isSjuEmail(email)) next.email = "Use your @sju.edu email address.";
    if (!username) next.username = "Username is required.";
    else if (!/^[a-z0-9._-]{3,20}$/.test(username))
      next.username = "Use 3–20 letters, numbers, dots, dashes or underscores.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords don't match.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      if (await usernameTaken(username)) {
        setErrors({ username: "That username is taken. Try another." });
        return;
      }
      await createAccount({ ...form, email, username, role });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") setErrors({ email: authErrorMessage(code) });
      else if (code === "auth/weak-password") setErrors({ password: authErrorMessage(code) });
      else setErrors({ form: "Couldn't create your account. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="TeamHub is open to anyone with an @sju.edu email.">
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField label="First name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
        <TextField label="Last name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        <TextField
          wrapperClassName="sm:col-span-2"
          label="SJU email"
          type="email"
          autoComplete="email"
          placeholder="you@sju.edu"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <TextField
          wrapperClassName="sm:col-span-2"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          error={errors.username}
          hint="Shown to teammates in messages."
        />
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium">I'm joining as</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cx(
                  "cursor-pointer rounded-lg border px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-crimson/40",
                  role === opt.value ? "border-crimson bg-crimson-soft" : "border-line bg-surface hover:border-muted",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={() => setRole(opt.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{opt.title}</span>
                <span className="block text-[13px] text-muted">{opt.detail}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-muted">Coaches: sign up as a player, then ask a TeamHub admin to upgrade your account.</p>
        </fieldset>

        {errors.form && (
          <div className="sm:col-span-2">
            <FormAlert>{errors.form}</FormAlert>
          </div>
        )}

        <Button type="submit" size="lg" loading={busy} className="w-full sm:col-span-2">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/Login" className="font-semibold text-crimson-ink hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
