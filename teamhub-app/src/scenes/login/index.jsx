import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
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
          firebase: "Incorrect email or password.",
        });
      } else {
        setErrors({
          firebase: "Unable to log in. Please try again.",
        });
      }
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrors({
        email: "Enter your email address first.",
      });
      return;
    }

    if (!normalizedEmail.endsWith("@sju.edu")) {
      setErrors({
        email: "You must use an SJU email address.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);

      setErrors({
        firebase:
          "Password reset email sent. Check your email for instructions.",
      });
    } catch (error) {
      console.error(error);

      setErrors({
        firebase:
          "Unable to send password reset email. Please try again.",
      });
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
        onSubmit={handleLogin}
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
          >
            LOGIN
          </Typography>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
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
            LOG IN
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Button
              type="button"
              variant="text"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </Button>
          </Box>

          <Typography align="center" variant="body2">
            Don't have an account?{" "}
            <Link
              component={RouterLink}
              to="/Create-Account"
              underline="hover"
            >
              Create Account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}