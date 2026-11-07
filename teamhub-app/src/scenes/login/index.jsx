import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { FormAlert, PasswordField, TextField } from "../../components/ui/Field";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const validateEmail = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return "Email is required.";
    if (!normalizedEmail.endsWith("@sju.edu")) 
      return "Use your @sju.edu email address.";
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setNotice("");

    const next = {};
    const emailError = validateEmail();

    if (emailError) next.email = emailError;
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);

    try{
      const normalizedEmail = email.trim().toLowerCase();

      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      navigate(from, {replace: true});
    } catch (err){
      console.error(err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setErrors({ form: "Incorrect email or password. Please try again." });
      } else {
        setErrors({ form: "Unable to log in. Please try again."});
      }
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async() => {
    setNotice("");
    const emailError = validateEmail();

    if (emailError) {
      setErrors({ email: emailError === "Email is required." ? "Enter your email address first." : emailError });
      return;
    }
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);

      setErrors({});
      setNotice("Password reset email sent. Check your SJU inbox.");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setErrors({ email: "No account found for that email address." });
      } else {
        setErrors({ form: "Unable to send password reset email. Please try again." });
      }
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