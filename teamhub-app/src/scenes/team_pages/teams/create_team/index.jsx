import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivitySelect from "../../../elements/activities/ActivitySelect";
import CalendarUpload from "../../../elements/calendar/CalendarUpload.jsx";
import { createTeam, teamNameExists } from "../../../../firestore/Teams";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// Validate Email
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateTeam({ onSubmit, onCancel }) {
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

  const validate = async () => {  
    const next = {};

    // Team Name Checks 
    if (!name.trim()) next.name = "Team name is required";
    else if (name.trim().length < 3) next.name = "Use at least 3 characters";
    else if (await teamNameExists(name)) next.name = "A team with that name already exists";
    
    // Description Check 
    if (!description.trim()) next.description = "Team Description is required";

    // Activity Check 
    if (!activity.trim()) next.activity = "Activity is required";

    // Member Check 
    const badEmails = members.filter((m) => !EMAIL_RE.test(m));
    if (badEmails.length) {
      next.members = `Invalid email: ${badEmails.join(", ")}`;
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const next = await validate();
      setErrors(next);
      if (Object.keys(next).length) {
        setSaving(false);
        return;
      }

      await createTeam({
        name,
        description,
        org_cat: activityType,
        org: activity,
        events: calendarEvents,
      });
      navigate("/Teams");
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
            error={Boolean(errors.description)}
            multiline
            minRows={3}
            fullWidth
            required
            slotProps={{ htmlInput: { maxLength: 250 } }}
            helperText={`${description.length}/250`}
          />
          <ActivitySelect
            type={activityType}
            onTypeChange={setActivityType}
            value={activity}
            error={Boolean(errors.activity)}
            required
            onChange={setActivity}
          />
          <CalendarUpload
            onEventsParsed={(parsed) => setCalendarEvents(parsed)}
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
            <Button variant="text" onClick={() => navigate(-1)}>
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