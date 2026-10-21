import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { PasswordField, TextField } from "../../components/ui/Field";
import { cx } from "../../lib/format";

const ROLE_OPTIONS = [
  { value: "player", title: "Player", detail: "I'm on a team roster" },
  { value: "follower", title: "Fan", detail: "I want to follow teams" },
];

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
  const [role, setRole] = useState("follower");
  const [errors, setErrors] = useState({});
  // TODO(backend): Add `const [busy, setBusy] = useState(false);` for the submit loading state,
  // and pass `loading={busy}` to the <Button> below.

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO(backend): Swap in the shared helpers from the auth service:
    // `normalizeEmail(form.email)` here and `isSjuEmail(email)` for the check below.
    const email = form.email.trim().toLowerCase();
    const username = form.username.trim().toLowerCase();
    const next = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!email) next.email = "Email is required.";
    else if (!email.endsWith("@sju.edu")) next.email = "Use your @sju.edu email address.";
    if (!username) next.username = "Username is required.";
    else if (!/^[a-z0-9._-]{3,20}$/.test(username))
      next.username = "Use 3–20 letters, numbers, dots, dashes or underscores.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords don't match.";

    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO(backend): Replace this with the real sign-up flow (make handleSubmit async):
    //   setBusy(true);
    //   try {
    //     // 1. Check the username is available; if taken, show the error and stop:
    //     //    if (await usernameTaken(username)) {
    //     //      setErrors({ username: "That username is taken. Try another." });
    //     //      return;
    //     //    }
    //     // 2. Create the account (Firebase Auth + user profile document):
    //     //    await createAccount({ ...form, email, username, role });
    //     // 3. Then navigate on success.
    //     navigate("/", { replace: true });
    //   } catch (err) {
    //     // 4. Map server errors onto the form using authErrorMessage(code):
    //     //    "auth/email-already-in-use" -> errors.email
    //     //    "auth/weak-password"        -> errors.password
    //     //    anything else               -> errors.form ("Couldn't create your account. Please try again.")
    //   } finally {
    //     setBusy(false);
    //   }
    navigate("/", { replace: true });
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
        />
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />

        {/* TODO(backend): Render a general server error here when `errors.form` is set,
            e.g. <FormAlert>{errors.form}</FormAlert> (import FormAlert from Field). */}

        <Button type="submit" size="lg" className="w-full sm:col-span-2">
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