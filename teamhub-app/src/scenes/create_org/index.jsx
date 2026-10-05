import { useState } from "react";
import SchoolClubSelect from "../activities/SchoolClubSelect.jsx";
import SportsTeamSelect from "../activities/SportsTeamSelect.jsx";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateOrg({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [sport, setSport] = useState("");
  const [club, setClub] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Team name is required";
    else if (name.trim().length < 3) next.name = "Use at least 3 characters";

    const badEmails = members.filter((m) => !EMAIL_RE.test(m));
    if (badEmails.length) {
      next.members = `Invalid email: ${badEmails.join(", ")}`;
    }
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const team = {
      name: name.trim(),
      description: description.trim(),
      visibility,
      members,
    };
    onSubmit?.(team);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setSport("");
    setClub("");
    setVisibility("private");
    setMembers([]);
    setErrors({});
    setSubmitted(false);
    onCancel?.();
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: { xs: 2, sm: 4 } }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ width: "100%", maxWidth: 560, p: { xs: 2.5, sm: 4 } }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Create team
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Set up a team and invite the people you work with.
            </Typography>
          </Box>

          {submitted && (
            <Alert severity="success" onClose={() => setSubmitted(false)}>
              Team created.
            </Alert>
          )}

          <TextField
            label="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 250 } }}
            helperText={`${description.length}/250`}
          />

          <SportsTeamSelect value={sport} onChange={setSport} />
          <SchoolClubSelect value={club} onChange={setClub} />

          <FormControl>
            <FormLabel id="visibility-label">Visibility</FormLabel>
            <RadioGroup
              aria-labelledby="visibility-label"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <FormControlLabel
                value="private"
                control={<Radio />}
                label="Private – only invited members can join"
              />
              <FormControlLabel
                value="public"
                control={<Radio />}
                label="Public – anyone can find and join"
              />
            </RadioGroup>
          </FormControl>

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={members}
            onChange={(_, value) => setMembers(value)}
            renderValue={(value, getItemProps) =>
              value.map((email, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    label={email}
                    size="small"
                    color={EMAIL_RE.test(email) ? "default" : "error"}
                    {...itemProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Invite members"
                placeholder="Type an email and press Enter"
                error={Boolean(errors.members)}
                helperText={errors.members}
              />
            )}
          />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button variant="text" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create team
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}