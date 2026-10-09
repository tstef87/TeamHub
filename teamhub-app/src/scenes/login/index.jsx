import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");

  const handleLogin = (e) => {
  e.preventDefault();

  const newErrors = {};

  if (!email) {
    newErrors.email = "Email is required.";
  } else if (!email.endsWith("@sju.edu")) {
    newErrors.email = "You must use an SJU email address.";
  }

  if (!password) {
    newErrors.password = "Password is required.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  console.log({
    email,
    password,
  });
};

  return (
  <div className="login-page">
    <div className="login-container">

      <h1>LOGIN</h1>

      <form
        className="login-form"
        onSubmit={handleLogin}
      >

        <div className="form-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "input-error" : ""}
          />

          {errors.email && (
            <p className="error-message">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "input-error" : ""}
          />

          {errors.password && (
            <p className="error-message">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="login-button"
        >
          LOG IN
        </button>

      </form>

      <p className="create-account-link">
        Don't have an account?{" "}
        <Link to="/Create-Account">
          Create Account
        </Link>
      </p>

    </div>
  </div>
  );
}