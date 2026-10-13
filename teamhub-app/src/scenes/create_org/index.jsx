import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivitySelect from "../activities/ActivitySelect.jsx";
import CalendarUpload from "../calendar/CalendarUpload.jsx";
import { createTeam } from "../../firestore/teams";

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

const EMAIL_RE = /^[^\s@]+@sju.edu;

export default function CreateOrg({ onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("sport");
  const [activity, setActivity] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
 
    setSaving(true);
    try {
      await createTeam({ name, description, org_cat: activityType, org: activity });
      navigate("/My-Teams"); // only runs if the save worked
    } catch (err) {
      console.error(err);
      setErrors({ form: err.message });
      setSaving(false);
    }
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setActivityType("sport");
    setActivity("");
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
          <ActivitySelect
            type={activityType}
            onTypeChange={setActivityType}
            value={activity}
            onChange={setActivity}
          />
          <CalendarUpload
            onEventsParsed={setCalendarEvents}
            onClear={() => setCalendarEvents([])}
          />
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
                label="Add Members"
                placeholder="Type an email and press Enter"
                error={Boolean(errors.members)}
                helperText={errors.members}
              />
            )}
          />
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button variant="text" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Creating..." : "Create team"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}