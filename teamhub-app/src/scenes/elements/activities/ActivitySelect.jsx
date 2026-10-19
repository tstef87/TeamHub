import { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@mui/material";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddIcon from "@mui/icons-material/Add";
import AlbumIcon from "@mui/icons-material/Album";
import BiotechIcon from "@mui/icons-material/Biotech";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CalculateIcon from "@mui/icons-material/Calculate";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChurchIcon from "@mui/icons-material/Church";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import EditNoteIcon from "@mui/icons-material/EditNote";
import EngineeringIcon from "@mui/icons-material/Engineering";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FestivalIcon from "@mui/icons-material/Festival";
import ForumIcon from "@mui/icons-material/Forum";
import GavelIcon from "@mui/icons-material/Gavel";
import GrassIcon from "@mui/icons-material/Grass";
import GroupsIcon from "@mui/icons-material/Groups";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HealingIcon from "@mui/icons-material/Healing";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import NightlifeIcon from "@mui/icons-material/Nightlife";
import PaletteIcon from "@mui/icons-material/Palette";
import ParkIcon from "@mui/icons-material/Park";
import PeopleIcon from "@mui/icons-material/People";
import PoolIcon from "@mui/icons-material/Pool";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PublicIcon from "@mui/icons-material/Public";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import RowingIcon from "@mui/icons-material/Rowing";
import SchoolIcon from "@mui/icons-material/School";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import SignLanguageIcon from "@mui/icons-material/SignLanguage";
import SpaIcon from "@mui/icons-material/Spa";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import SportsRugbyIcon from "@mui/icons-material/SportsRugby";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import StadiumIcon from "@mui/icons-material/Stadium";
import SynagogueIcon from "@mui/icons-material/Synagogue";
import TerrainIcon from "@mui/icons-material/Terrain";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import WomanIcon from "@mui/icons-material/Woman";
 
// School Clubs List
export const SCHOOL_CLUBS = [
  { id: "accounting", name: "Accounting", Icon: CalculateIcon },
  { id: "african-caribbean", name: "African & Caribbean Students", Icon: Diversity2Icon },
  { id: "asl", name: "American Sign Language", Icon: SignLanguageIcon },
  { id: "art", name: "Art", Icon: PaletteIcon },
  { id: "asian", name: "Asian Students", Icon: Diversity3Icon },
  { id: "biology", name: "Biology", Icon: BiotechIcon },
  { id: "black-student-union", name: "Black Student Union", Icon: Diversity1Icon },
  { id: "business", name: "Business", Icon: BusinessCenterIcon },
  { id: "consulting", name: "Consulting", Icon: HandshakeIcon },
  { id: "dance", name: "Dance", Icon: NightlifeIcon },
  { id: "economics", name: "Economics", Icon: TrendingUpIcon },
  { id: "engineering-robotics", name: "Engineering & Robotics", Icon: EngineeringIcon },
  { id: "entertainment", name: "Entertainment", Icon: LocalActivityIcon },
  { id: "film", name: "Film", Icon: MovieIcon },
  { id: "first-generation", name: "First Generation Students", Icon: SchoolIcon },
  { id: "gaming-tabletop", name: "Gaming & Tabletop", Icon: SportsEsportsIcon },
  { id: "greek-life", name: "Greek Life", Icon: AccountBalanceIcon },
  { id: "health-wellness", name: "Health & Wellness", Icon: SpaIcon },
  { id: "international", name: "International Students", Icon: PublicIcon },
  { id: "italian", name: "Italian", Icon: LocalPizzaIcon },
  { id: "jewish", name: "Jewish Students", Icon: SynagogueIcon },
  { id: "law", name: "Law", Icon: GavelIcon },
  { id: "latinx", name: "Latinx Students", Icon: GroupsIcon },
  { id: "marketing", name: "Marketing", Icon: CampaignIcon },
  { id: "medical-pre-medical", name: "Medical / Pre-Medical", Icon: MedicalServicesIcon },
  { id: "mental-health", name: "Mental Health", Icon: SelfImprovementIcon },
  { id: "middle-eastern", name: "Middle Eastern Students", Icon: PeopleIcon },
  { id: "music", name: "Music", Icon: MusicNoteIcon },
  { id: "nursing", name: "Nursing", Icon: LocalHospitalIcon },
  { id: "occupational-therapy", name: "Occupational Therapy", Icon: AccessibilityIcon },
  { id: "pharmacy", name: "Pharmacy", Icon: LocalPharmacyIcon },
  { id: "physical-therapy", name: "Physical Therapy", Icon: HealingIcon },
  { id: "pilipino-cultural", name: "Pilipino Cultural", Icon: FestivalIcon },
  { id: "political-government", name: "Political / Government", Icon: HowToVoteIcon },
  { id: "psychology", name: "Psychology", Icon: PsychologyIcon },
  { id: "religious-christian", name: "Religious / Christian", Icon: ChurchIcon },
  { id: "service-volunteer", name: "Service & Volunteer", Icon: VolunteerActivismIcon },
  { id: "speech-debate", name: "Speech & Debate", Icon: ForumIcon },
  { id: "sports-analytics", name: "Sports Analytics", Icon: QueryStatsIcon },
  { id: "sports-marketing", name: "Sports Marketing", Icon: SportsScoreIcon },
  { id: "theater", name: "Theater", Icon: TheaterComedyIcon },
  { id: "womens-organizations", name: "Women's Organizations", Icon: WomanIcon },
  { id: "lgbtq-pride", name: "LGBTQ+ / Pride", Icon: FavoriteIcon },
  { id: "student-government", name: "Student Government", Icon: HowToRegIcon },
  { id: "sustainability-environmental", name: "Sustainability / Environmental", Icon: ParkIcon },
  { id: "veterans-military", name: "Veterans / Military", Icon: MilitaryTechIcon },
  { id: "writing-literature", name: "Writing & Literature", Icon: EditNoteIcon },
  { id: "other", name: "Other", Icon: AddIcon },
];
 
// School Sports List
export const SPORTS_TEAMS = [
  { id: "baseball", name: "Baseball", Icon: SportsBaseballIcon },
  { id: "basketball", name: "Basketball", Icon: SportsBasketballIcon },
  { id: "cross-country", name: "Cross Country", Icon: TerrainIcon },
  { id: "dance", name: "Dance", Icon: NightlifeIcon },
  { id: "esports", name: "Esports", Icon: SportsEsportsIcon },
  { id: "field-hockey", name: "Field Hockey", Icon: GrassIcon },
  { id: "flag-football", name: "Flag Football", Icon: SportsFootballIcon },
  { id: "gaelic-football", name: "Gaelic Football", Icon: SportsHandballIcon },
  { id: "golf", name: "Golf", Icon: SportsGolfIcon },
  { id: "ice-hockey", name: "Ice Hockey", Icon: SportsHockeyIcon },
  { id: "judo", name: "Judo", Icon: SportsMartialArtsIcon },
  { id: "lacrosse", name: "Lacrosse", Icon: SportsCricketIcon },
  { id: "rowing", name: "Rowing", Icon: RowingIcon },
  { id: "rugby", name: "Rugby", Icon: SportsRugbyIcon },
  { id: "running", name: "Running", Icon: DirectionsRunIcon },
  { id: "soccer", name: "Soccer", Icon: SportsSoccerIcon },
  { id: "softball", name: "Softball", Icon: SportsBaseballIcon },
  { id: "swimming", name: "Swimming", Icon: PoolIcon },
  { id: "tennis", name: "Tennis", Icon: SportsTennisIcon },
  { id: "track-field", name: "Track & Field", Icon: StadiumIcon },
  { id: "ultimate-frisbee", name: "Ultimate Frisbee", Icon: AlbumIcon },
  { id: "volleyball", name: "Volleyball", Icon: SportsVolleyballIcon },
  { id: "other", name: "Other", Icon: AddIcon },
];

const OPTIONS_BY_TYPE = {
  club: SCHOOL_CLUBS,
  sport: SPORTS_TEAMS,
};

const LABEL_BY_TYPE = {
  club: "School Club",
  sport: "Sports Team",
};

export default function ActivitySelect({
  type,
  onTypeChange,
  value,
  onChange,
  label,
  fullWidth = true,
  error = false,
}) {
  // Works controlled (type/value + handlers) or on its own.
  const [p_internalType, set_p_InternalType] = useState("sport");
  const [p_activity, set_p_activity] = useState("");
  const currentType = type ?? p_internalType;
  const current = value ?? p_activity;

  const options = OPTIONS_BY_TYPE[currentType];
  const selectLabel = label ?? LABEL_BY_TYPE[currentType];

  const handleTypeChange = (e) => {
    const next = e.target.value;
    set_p_InternalType(next);
    onTypeChange?.(next);
    // The two lists have different options, so clear the old selection.
    set_p_activity("");
    onChange?.("");
  };

  const handleChange = (e) => {
    set_p_activity(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <Stack spacing={1.5}>
      <FormControl>
        <FormLabel id="activity-type-label">Type</FormLabel>
        <RadioGroup
          row
          aria-labelledby="activity-type-label"
          value={currentType}
          onChange={handleTypeChange}
        >
          <FormControlLabel value="sport" control={<Radio />} label="Sport" />
          <FormControlLabel value="club" control={<Radio />} label="Club" />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth={fullWidth} error={error}>
        <InputLabel id="activity-label">{selectLabel}</InputLabel>
        <Select
          labelId="activity-label"
          id="activity-select"
          value={current}
          label={selectLabel}
          onChange={handleChange}
          renderValue={(selected) => {
            const item = options.find((o) => o.id === selected);
            if (!item) return "";
            return (
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <item.Icon fontSize="small" />
                {item.name}
              </span>
            );
          }}
        >
          {options.map(({ id, name, Icon }) => (
            <MenuItem key={id} value={id}>
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{name}</ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}