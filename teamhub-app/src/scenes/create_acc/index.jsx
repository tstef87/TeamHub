import React, { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const newErrors = {};

    if (!firstName) {
        newErrors.firstName = "First name is required.";
    }

    if (!lastName) {
        newErrors.lastName = "Last name is required.";
    }

    if (!normalizedEmail) {
        newErrors.email = "Email is required.";
    } else if (!normalizedEmail.endsWith("@sju.edu")) {
        newErrors.email = "Must use an @sju.edu email.";
    }

    if (!normalizedUsername) {
        newErrors.username = "Username is required.";
    }

    if (!password) {
        newErrors.password = "Password is required.";
    } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        return;
    }

    const usernameRef = doc(db, "usernames", normalizedUsername);
    const usernameSnapshot = await getDoc(usernameRef);

    if (usernameSnapshot.exists()) {
      setErrors({
        username: "That username has been taken."
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "usernames", normalizedUsername), {
        uid: user.uid
    });

    await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        username: normalizedUsername
    });

    console.log("Account created:", user);

    navigate("/");

    } catch (error) {
    console.error(error);

    if (error.code === "auth/weak-password") {
        setErrors({
        password: "Password must be at least 6 characters."
        });
    } else if (error.code === "auth/email-already-in-use") {
        setErrors({
        email: "That email is already in use."
        });
    } else {
        setErrors({
        firebase: "Unable to create account. Please try again."
        });
    }
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

        {/* Username Field */}
        <div className="form-field full-width">
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={errors.username ? "input-error" : ""}
        />

        {errors.username && (
            <p className="error-message">
            {errors.username}
            </p>
        )}
        </div>

        {/* Password Field */}
        <div className="form-field">
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
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {errors.password && (
                <p className="error-message">{errors.password}</p>
            )}
        </div>

        {/* Confirm Password Field */}
        <div className="form-field">
            <div className="password-input-wrapper">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "input-error" : ""}
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                        showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                    }
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
            )}
        </div>

        {errors.firebase && (<p className="error-message">{errors.firebase}</p>)}

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