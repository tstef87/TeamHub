import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState("");

  const handleCreateAccount = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!firstName) {
        newErrors.firstName = "First name is required.";
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required.";
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!email.endsWith("@sju.edu")) {
       newErrors.email = "Must use an @sju.edu email.";
    }

    if (!password) {
       newErrors.password = "Password is required.";
    }

    if (!confirmPassword) {
       newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
       newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!role) {
       newErrors.role = "Please select a role.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
  };

  return (
  <div className="create-account-page">
    <div className="create-account-container">

      <h1>CREATE ACCOUNT</h1>

      <form
        className="create-account-form"
        onSubmit={handleCreateAccount}
      >

        {/* First Name Field */}
        <div className="form-field">
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? "input-error" : ""}
            />
            {errors.firstName && (<p className="error-message">{errors.firstName}</p>)}
        </div>

        {/* Last Name Field */}
        <div className="form-field">
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? "input-error" : ""}
        />
            {errors.lastName && (<p className="error-message">{errors.lastName}</p>)}
        </div>

        {/* Email Field */}
        <div className="form-field full-width">
            <input
                type="email"
                placeholder="SJU Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "input-error" : ""}
            />
            {errors.email && (<p className="error-message">{errors.email}</p>)}
        </div>

        {/* Password Field */}
        <div className="form-field">
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "input-error" : ""}
            />
            {errors.password && (<p className="error-message">{errors.password}</p>)}
        </div>

        {/* Confirm Password Field */}
        <div className="form-field">
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (<p className="error-message">{errors.confirmPassword}</p>)}
        </div>

        {/* Role Field */}
        <div className="form-field full-width">
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={errors.role ? "input-error" : ""}
            >
            <option value="">Select Role</option>
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="follower">Follower</option>
            </select>
            {errors.role && (<p className="error-message">{errors.role}</p>)}
        </div>

        <button type="submit" className="create-account-button">CREATE ACCOUNT</button>
      </form>
      <p className="login-link">
        Already have an account?{" "}
        <Link to="/Login">Log In</Link>
      </p>
    </div>
  </div>
  );
}