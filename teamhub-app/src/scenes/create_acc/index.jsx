import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!lastName.trim()) {
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
        username: "That username has been taken.",
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
        uid: user.uid,
      });

      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        username: normalizedUsername,
      });

      console.log("Account created:", user);

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/weak-password") {
        setErrors({
          password: "Password must be at least 6 characters.",
        });
      } else if (error.code === "auth/email-already-in-use") {
        setErrors({
          email: "That email is already in use.",
        });
      } else {
        setErrors({
          firebase: "Unable to create account. Please try again.",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2.5, sm: 4 },
      }}
    >
      <Paper
        component="form"
        onSubmit={handleCreateAccount}
        noValidate
        sx={{
          width: "100%",
          maxWidth: 550,
          p: { xs: 3, sm: 6 },
          borderRadius: "20px",
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            fontWeight={800}
            sx={{
              letterSpacing: "0.5px",
              mb: 1,
            }}
          >
            CREATE ACCOUNT
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2.5,
            }}
          >
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              fullWidth
            />

            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              fullWidth
            />

            <TextField
              label="SJU Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={Boolean(errors.username)}
              helperText={errors.username}
              fullWidth
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {errors.firebase && (
            <Typography
              variant="body2"
              color="error"
              align="center"
            >
              {errors.firebase}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              fontSize: "1.1rem",
              fontWeight: 750,
              borderRadius: "10px",
            }}
          >
            CREATE ACCOUNT
          </Button>

          <Typography align="center" variant="body2">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/Login"
              underline="hover"
            >
              Log In
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}