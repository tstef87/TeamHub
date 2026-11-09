import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { PasswordField, TextField, FormAlert } from "../../components/ui/Field";

import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";

// Keep your existing UI imports (AuthLayout, TextField, PasswordField, Button, Link,
// useNavigate, useState, auth, db). Make sure these are imported too:
//
//   import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
//   import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";

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
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

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

    setBusy(true);

    try {
      // One doc per user, keyed by username: users/{username}
      const userRef = doc(db, "users", username);
      console.log("1. checking username", userRef.path);

      // Quick check so most people see the error before an auth account is created
      if ((await getDoc(userRef)).exists()) {
        setErrors({ username: "This username is already taken." });
        return;
      }
      console.log("2. username free, creating auth account");

      const { user } = await createUserWithEmailAndPassword(auth, email, form.password);
      console.log("3. auth account created", user.uid);

      // Claim the username in a transaction so two people signing up at once can't both get it
      try {
        await runTransaction(db, async (tx) => {
          console.log("4. inside transaction");
          const snap = await tx.get(userRef);
          if (snap.exists()) throw new Error("username-taken");
          tx.set(userRef, {
            uid: user.uid,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email,
            createdAt: serverTimestamp(),
          });
        });
        console.log("5. profile saved");
      } catch (err) {
        console.error("transaction failed:", err.code, err.message);
        // Don't leave an auth account behind with no profile
        await deleteUser(user).catch((e) => console.error("deleteUser failed:", e.code, e.message));
        if (err.message === "username-taken") {
          setErrors({ username: "This username is already taken." });
          return;
        }
        throw err;
      }

      console.log("Account created:", user.uid, "as", username);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);

      if (err.code === "auth/weak-password") {
        setErrors({ password: "Password should be at least 6 characters." });
      } else if (err.code === "auth/email-already-in-use") {
        setErrors({ email: "That email is already in use." });
      } else if (err.code === "auth/invalid-email") {
        setErrors({ email: "That email address isn't valid." });
      } else {
        // TODO: switch back to the plain message once sign-up works
        setErrors({ form: `Unable to create account (${err.code || err.message}).` });
      }
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
        />
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />

        {errors.form && (
          <div className="sm:col-span-2">
            <FormAlert>{errors.form}</FormAlert>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full sm:col-span-2" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
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