import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { FormAlert, PasswordField, TextField } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";
import { authErrorMessage, isSjuEmail, normalizeEmail, resetPassword, signIn } from "../../services/auth";

type Errors = Partial<Record<"email" | "password" | "form", string>>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const validateEmail = (): string | undefined => {
    const e = normalizeEmail(email);
    if (!e) return "Email is required.";
    if (!isSjuEmail(e)) return "Use your @sju.edu email address.";
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setNotice("");
    const next: Errors = {};
    const emailError = validateEmail();
    if (emailError) next.email = emailError;
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setErrors({ form: authErrorMessage((err as { code?: string }).code) });
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setNotice("");
    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError === "Email is required." ? "Enter your email address first." : emailError });
      return;
    }
    try {
      await resetPassword(email);
      setErrors({});
      setNotice("Password reset email sent. Check your SJU inbox for the link.");
    } catch (err) {
      console.error(err);
      setErrors({ form: "Couldn't send the reset email. Please try again." });
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Use your SJU email and TeamHub password.">
      <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
        <TextField
          label="SJU email"
          type="email"
          autoComplete="email"
          placeholder="you@sju.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className="self-end text-sm font-medium text-crimson-ink hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {errors.form && <FormAlert>{errors.form}</FormAlert>}
        {notice && <FormAlert tone="success">{notice}</FormAlert>}

        <Button type="submit" size="lg" loading={busy} className="mt-1 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to TeamHub?{" "}
        <Link to="/Create-Account" className="font-semibold text-crimson-ink hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
