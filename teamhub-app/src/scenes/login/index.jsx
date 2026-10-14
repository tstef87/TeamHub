import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../../firebase";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();

  const newErrors = {};

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    newErrors.email = "Email is required.";
  } else if (!normalizedEmail.endsWith("@sju.edu")) {
    newErrors.email = "You must use an SJU email address.";
  }

  if (!password) {
    newErrors.password = "Password is required.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    navigate("/");
  } catch (error) {
    console.error(error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      setErrors({
        firebase: "Incorrect email or password."
      });
    } else {
      setErrors({
        firebase: "Unable to log in. Please try again."
      });
    }
  }
};
const handleForgotPassword = async () => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    setErrors({
      email: "Enter your email address first."
    });
    return;
  }

  if (!normalizedEmail.endsWith("@sju.edu")) {
    setErrors({
      email: "You must use an SJU email address."
    });
    return;
  }

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);

    setErrors({
      firebase: "Password reset email sent. Check your email for instructions."
    });
  } catch (error) {
    console.error(error);

    setErrors({
      firebase: "Unable to send password reset email. Please try again."
    });
  }
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

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "input-error" : ""}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {errors.firebase && (<p className="error-message">{errors.firebase}</p>)}

        <button
          type="submit"
          className="login-button"
        >
          LOG IN
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="forgot-password-link"
        >
          Forgot Password?
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