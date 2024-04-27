import { FormEvent, useEffect, useState } from "react";
import { useIsAuthenticated } from "@/hooks/auth";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import { login } from "@/hooks/auth";

export const LoginView = () => {
  const [isAuthenticated, setIsAuthenticated] = useIsAuthenticated();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openBar, setOpenBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/admin";
    }
  }, [isAuthenticated]);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;

    setOpenBar(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await login(username, password);

    if (result === null) {
      setIsAuthenticated(true);
      window.location.href = "/admin";
    } else {
      setErrorMessage(result.response.data.detail);
      setOpenBar(true);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
      </Box>
      <Snackbar
        open={openBar}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
