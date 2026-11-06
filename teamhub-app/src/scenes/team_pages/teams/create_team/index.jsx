import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { TextAreaField, TextField, inputClass } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import { PageHeader } from "../../../../components/ui/misc";
import CalendarUpload from "../../../../components/team/CalendarUpload";
import { SCHOOL_CLUBS, SPORTS_TEAMS } from "../../../../lib/activities";
import { cx } from "../../../../lib/format";
import { createTeam, teamNameExists } from "../../../../firestore/Teams";

// Validate Email
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const splitEmails = (raw) =>
  raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export default function CreateTeam() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("sport");
  const [activity, setActivity] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberDraft, setMemberDraft] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Options for the activity <select>. Assumes each entry is { id, name }.
  const options = activityType === "sport" ? SPORTS_TEAMS : SCHOOL_CLUBS;

  const addMember = (raw) => {
    const emails = splitEmails(raw);
    if (!emails.length) return;
    setMembers((m) => [...new Set([...m, ...emails])]);
    setMemberDraft("");
  };

  const onMemberKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addMember(memberDraft);
    } else if (e.key === "Backspace" && !memberDraft && members.length) {
      setMembers((m) => m.slice(0, -1));
    }
  };

  const validate = async (memberList, trimmedName) => {
    const next = {};
    // Team Name Checks
    if (!trimmedName) next.name = "Team name is required";
    else if (trimmedName.length < 3) next.name = "Use at least 3 characters";
    else if (trimmedName.length > 32) next.name = "Use 32 characters or fewer";
    else if (await teamNameExists(trimmedName)) next.name = "A team with that name already exists";
    // Description Check
    if (!description.trim()) next.description = "Add a short description.";
    // Activity Check
    if (!activity) next.activity = activityType === "sport" ? "Choose a sport." : "Choose a club type.";
    // Member Check
    const badEmails = memberList.filter((m) => !EMAIL_RE.test(m));
    if (badEmails.length) {
      next.members = `Invalid email: ${badEmails.join(", ")}`;
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const trimmedName = name.trim();
      // Include any half-typed email still in the input box.
      const finalMembers = [...new Set([...members, ...splitEmails(memberDraft)])];
      setMembers(finalMembers);
      setMemberDraft("");

      const next = await validate(finalMembers, trimmedName);
      setErrors(next);
      if (Object.keys(next).length) {
        setSaving(false);
        return;
      }

      await createTeam({
        name: trimmedName,
        description: description.trim(),
        org_cat: activityType,
        org: activity,
        events: calendarEvents,
        members: finalMembers,
      });
      navigate("/Teams");
    } catch (err) {
      console.error(err);
      setErrors({ form: err.message });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create a team" description="Set up the team page. You can add your schedule and invite players now or later." />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-5 sm:p-8">
        <TextField 
          label="Team name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          maxLength={32}
          error={errors.name} 
          placeholder="e.g. SJU Club Ice Hockey" autoFocus 
          hint={`${name.length}/32`}
        />

        <TextAreaField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={250}
          rows={3}
          error={errors.description}
          hint={`${description.length}/250`}
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1.5 text-sm font-medium">Type</legend>
          <div className="flex gap-1 self-start rounded-lg bg-surface-sunk p-1">
            {["sport", "club"].map((t) => (
              <label
                key={t}
                className={cx(
                  "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-crimson/40",
                  activityType === t ? "bg-surface text-ink shadow-sm" : "text-muted",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={activityType === t}
                  onChange={() => {
                    setActivityType(t);
                    setActivity("");
                  }}
                />
                {t === "sport" ? "Sport" : "Club"}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="activity" className="text-sm font-medium">
              {activityType === "sport" ? "Sport" : "Club type"}
            </label>
            <select
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className={cx(inputClass(Boolean(errors.activity)), "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10")}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b6168' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              }}
              aria-invalid={Boolean(errors.activity) || undefined}
            >
              <option value="">Select…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            {errors.activity && <p className="text-[13px] font-medium text-danger">{errors.activity}</p>}
          </div>
        </fieldset>

        <CalendarUpload onEventsParsed={setCalendarEvents} onClear={() => setCalendarEvents([])} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="members" className="text-sm font-medium">
            Invite players
          </label>
          <div
            className={cx(
              "flex flex-wrap gap-1.5 rounded-lg border bg-surface px-2 py-2 focus-within:ring-2 focus-within:ring-crimson/25",
              errors.members ? "border-danger" : "border-line focus-within:border-crimson",
            )}
          >
            {members.map((m) => (
              <span
                key={m}
                className={cx(
                  "inline-flex items-center gap-1 rounded-md py-1 pl-2.5 pr-1 text-sm",
                  EMAIL_RE.test(m) ? "bg-surface-sunk" : "bg-danger/10 text-danger",
                )}
              >
                {m}
                <button type="button" onClick={() => setMembers((list) => list.filter((x) => x !== m))} className="rounded p-0.5 hover:bg-black/5" aria-label={`Remove ${m}`}>
                  <Icon name="x" size={14} />
                </button>
              </span>
            ))}
            <input
              id="members"
              value={memberDraft}
              onChange={(e) => setMemberDraft(e.target.value)}
              onKeyDown={onMemberKey}
              onBlur={() => addMember(memberDraft)}
              placeholder={members.length ? "" : "Type an email and press Enter"}
              className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-[15px] focus:outline-none"
            />
          </div>
          {errors.members ? (
            <p className="text-[13px] font-medium text-danger">{errors.members}</p>
          ) : (
            <p className="text-[13px] text-muted">They'll show on the roster once they join TeamHub.</p>
          )}
        </div>

        {errors.form && (
          <p role="alert" className="text-[13px] font-medium text-danger">
            {errors.form}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Creating..." : "Create team"}
          </Button>
        </div>
      </form>
    </div>
  );
}