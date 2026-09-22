// src/App.jsx
import { useState } from "react";
import {
  Theme,
  Box,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Button,
  Separator,
} from "@radix-ui/themes";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // TODO: wire up to firebase auth (signInWithEmailAndPassword, etc.)
    console.log("Logging in with:", email);
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: "100vh", background: "var(--gray-1)" }}
    >
      <Card size="4" style={{ width: 360 }}>
        <Flex direction="column" gap="4">
          <Box>
            <Heading size="6" mb="1">
              Welcome back
            </Heading>
            <Text size="2" color="gray">
              Sign in to your TeamHub account
            </Text>
          </Box>

          <Separator size="4" />

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                  Email
                </Text>
                <TextField.Root
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="3"
                />
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                  Password
                </Text>
                <TextField.Root
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="3"
                />
              </Box>

              {error && (
                <Text size="2" color="red">
                  {error}
                </Text>
              )}

              <Button size="3" type="submit" style={{ marginTop: 8 }}>
                Sign in
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  );
}

export default App;