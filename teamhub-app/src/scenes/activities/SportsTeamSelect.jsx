import { useState } from "react";
import {
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import SportsRugbyIcon from "@mui/icons-material/SportsRugby";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import AddIcon from "@mui/icons-material/Add";

// Edit this list to change the options.
export const SPORTS_TEAMS = [
  { id: "baseball", name: "Baseball", Icon: SportsBaseballIcon },
  { id: "basketball", name: "Basketball", Icon: SportsBasketballIcon },
  { id: "cricket", name: "Cricket", Icon: SportsCricketIcon },
  { id: "football", name: "Football", Icon: SportsFootballIcon },
  { id: "golf", name: "Golf", Icon: SportsGolfIcon },
  { id: "hockey", name: "Hockey", Icon: SportsHockeyIcon },
  { id: "rugby", name: "Rugby", Icon: SportsRugbyIcon },
  { id: "soccer", name: "Soccer", Icon: SportsSoccerIcon },
  { id: "tennis", name: "Tennis", Icon: SportsTennisIcon },
  { id: "volleyball", name: "Volleyball", Icon: SportsVolleyballIcon },
  { id: "other", name: "Other", Icon: AddIcon},
];

export default function SportsTeamSelect({
  value,
  onChange,
  label = "School Team",
  fullWidth = true,
  error = false,
}) {
  // Works controlled (value/onChange) or on its own.
  const [internal, setInternal] = useState("");
  const current = value ?? internal;

  const handleChange = (e) => {
    setInternal(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} error={error}>
      <InputLabel id="sports-team-label">{label}</InputLabel>
      <Select
        labelId="sports-team-label"
        id="sports-team-select"
        value={current}
        label={label}
        onChange={handleChange}
        renderValue={(selected) => {
          const team = SPORTS_TEAMS.find((t) => t.id === selected);
          if (!team) return "";
          return (
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <team.Icon fontSize="small" />
              {team.name}
            </span>
          );
        }}
      >
        {SPORTS_TEAMS.map(({ id, name, Icon }) => (
          <MenuItem key={id} value={id}>
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{name}</ListItemText>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
