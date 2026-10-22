import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { FormAlert, PasswordField, TextField } from "../../components/ui/Field";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  // TODO(backend): Add `const [busy, setBusy] = useState(false);` for the submit loading state,
  // and pass `loading={busy}` to the <Button> below.

  // TODO(backend): If the user is already signed in, redirect them instead of showing the form:
  //   const { user } = useAuth();
  //   if (user) return <Navigate to={from} replace />;
  // (import Navigate from react-router-dom and useAuth from context/AuthContext).
  // Place it after all the hooks so the hook order stays the same.

  const validateEmail = () => {
    // TODO(backend): Swap in the shared helpers from the auth service:
    // `normalizeEmail(email)` and `isSjuEmail(e)`.
    const e = email.trim().toLowerCase();
    if (!e) return "Email is required.";
    if (!e.endsWith("@sju.edu")) return "Use your @sju.edu email address.";
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setNotice("");
    const next = {};
    const emailError = validateEmail();
    if (emailError) next.email = emailError;
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO(backend): Replace this with the real sign-in (make handleLogin async):
    //   setBusy(true);
    //   try {
    //     await signIn(email, password);
    //     navigate(from, { replace: true });
    //   } catch (err) {
    //     // Show the server error in the form alert:
    //     setErrors({ form: authErrorMessage(err.code) });
    //   } finally {
    //     setBusy(false);
    //   }
    navigate(from, { replace: true });
  };

  const handleForgotPassword = () => {
    setNotice("");
    const emailError = validateEmail();
    if (emailError) {
      setErrors({ email: emailError === "Email is required." ? "Enter your email address first." : emailError });
      return;
    }
    // TODO(backend): Send the password reset email (make handleForgotPassword async):
    //   try {
    //     await resetPassword(email);
    //     setErrors({});
    //     setNotice("Password reset email sent. Check your SJU inbox for the link.");
    //   } catch (err) {
    //     console.error(err);
    //     setErrors({ form: "Couldn't send the reset email. Please try again." });
    //   }
    setErrors({});
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

        <Button type="submit" size="lg" className="mt-1 w-full">
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