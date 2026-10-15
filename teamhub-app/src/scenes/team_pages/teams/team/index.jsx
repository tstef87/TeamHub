import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { getTeam } from "../../../../firestore/teams";

export default function TeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getTeam(teamId)
      .then((t) => {
        if (!cancelled) setTeam(t);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // TODO: Loading Circle, wrap around entire project
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error Handeling 
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!team) return <Alert severity="warning">Team not found.</Alert>;

  // Display Team info 
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: { xs: 2, sm: 4 } }}>
      <Stack spacing={3}>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {team.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 2 }}>
            {team.org}
          </Typography>
          <Typography>{team.description}</Typography>
        </Paper>

        <Button variant="contained" onClick={() => navigate("/teams")} sx={{ alignSelf: "flex-start" }}>
          Return
        </Button>
      </Stack>
    </Box>
  );
}