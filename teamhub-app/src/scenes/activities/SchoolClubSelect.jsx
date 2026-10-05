import { useState } from "react";
import {
  FormControl,
  Icon,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CodeIcon from "@mui/icons-material/Code";
import ParkIcon from "@mui/icons-material/Park";
import ForumIcon from "@mui/icons-material/Forum";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PaletteIcon from "@mui/icons-material/Palette";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ScienceIcon from "@mui/icons-material/Science";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AddIcon from "@mui/icons-material/Add";

// Edit this list to change the options.
export const SCHOOL_CLUBS = [
  { id: "art", name: "Art Club", Icon: PaletteIcon },
  { id: "book", name: "Book Club", Icon: MenuBookIcon },
  { id: "coding", name: "Coding Club", Icon: CodeIcon },
  { id: "debate", name: "Debate Club", Icon: ForumIcon },
  { id: "drama", name: "Drama Club", Icon: TheaterComedyIcon },
  { id: "environmental", name: "Environmental Club", Icon: ParkIcon },
  { id: "gaming", name: "Gaming Club", Icon: SportsEsportsIcon },
  { id: "math", name: "Math Club", Icon: CalculateIcon },
  { id: "music", name: "Music Club", Icon: MusicNoteIcon },
  { id: "newspaper", name: "Student Newspaper", Icon: NewspaperIcon },
  { id: "photography", name: "Photography Club", Icon: PhotoCameraIcon },
  { id: "robotics", name: "Robotics Club", Icon: SmartToyIcon },
  { id: "science", name: "Science Club", Icon: ScienceIcon },
  { id: "volunteer", name: "Volunteer Club", Icon: VolunteerActivismIcon },
  { id: "other", name: "Other", Icon: AddIcon}
];

export default function SchoolClubSelect({
  value,
  onChange,
  label = "School Club",
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
      <InputLabel id="school-club-label">{label}</InputLabel>
      <Select
        labelId="school-club-label"
        id="school-club-select"
        value={current}
        label={label}
        onChange={handleChange}
        renderValue={(selected) => {
          const club = SCHOOL_CLUBS.find((c) => c.id === selected);
          if (!club) return "";
          return (
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <club.Icon fontSize="small" />
              {club.name}
            </span>
          );
        }}
      >
        {SCHOOL_CLUBS.map(({ id, name, Icon }) => (
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
