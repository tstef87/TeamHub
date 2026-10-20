import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EditProfile() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Load existing user data
  useEffect(() => {
    let active = true;
    let unsubscribe;

    const initializeAuthListener = async () => {
      await auth.authStateReady();
      if (!active) return;

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!active) return;

        if (!user) {
          navigate("/Login", {
            replace: true,
            state: { from: "/Edit-Profile" },
          });
          return;
        }

        setCurrentUser(user);

        const fetchUser = async () => {
          try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) {
              const data = userSnap.data();
              setFirstName(data.firstName || "");
              setLastName(data.lastName || "");
              setUsername(data.username || "");
              setEmail(data.email || "");
            }
          } catch (err) {
            console.error(err);
            if (active) setErrors({ firebase: "Could not load profile." });
          } finally {
            if (active) setLoading(false);
          }
        };

        fetchUser();
      });
    };

    initializeAuthListener().catch((err) => {
      console.error(err);
      if (active) {
        setErrors({ firebase: "Could not verify your login." });
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess(false);

    // Safety guard: ensure we have an authenticated user
    if (!currentUser) {
      setErrors({ firebase: "You must be logged in to save changes." });
      return;
    }

    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      setErrors({ firebase: "Unable to save changes. Please try again." });
    }
  };

  if (loading) return <div className="create-account-page">Loading...</div>;

  return (
    <div className="create-account-page">
      <div className="create-account-container">
        <h1>EDIT PROFILE</h1>

        <form className="create-account-form" onSubmit={handleSave}>
          {/* First Name */}
          <div className="form-field">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={errors.firstName ? "input-error" : ""}
            />
            {errors.firstName && <p className="error-message">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div className="form-field">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={errors.lastName ? "input-error" : ""}
            />
            {errors.lastName && <p className="error-message">{errors.lastName}</p>}
          </div>

          {/* Email (read-only) */}
          <div className="form-field full-width">
            <input
              type="email"
              placeholder="SJU Email"
              value={email}
              readOnly
              className="input-readonly"
            />
            <p className="helper-text">Email cannot be changed here.</p>
          </div>

          {/* Username (read-only) */}
          <div className="form-field full-width">
            <input
              type="text"
              placeholder="Username"
              value={username}
              readOnly
              className="input-readonly"
            />
            <p className="helper-text">Username is permanent.</p>
          </div>

          {errors.firebase && <p className="error-message">{errors.firebase}</p>}
          {success && <p className="success-message">Profile updated!</p>}

          <button type="submit" className="create-account-button">
            SAVE CHANGES
          </button>
        </form>

        <p className="login-link">
          <Link to="/">Cancel</Link>
        </p>
      </div>
    </div>
  );
}