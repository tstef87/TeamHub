// Sports and clubs a team can belong to. The ids are what gets stored in
// teams.org, so they match the lists in the old ActivitySelect.jsx exactly.

export interface Activity {
  id: string;
  name: string;
}

export const SPORTS_TEAMS: Activity[] = [
  { id: "baseball", name: "Baseball" },
  { id: "basketball", name: "Basketball" },
  { id: "cross-country", name: "Cross Country" },
  { id: "dance", name: "Dance" },
  { id: "esports", name: "Esports" },
  { id: "field-hockey", name: "Field Hockey" },
  { id: "flag-football", name: "Flag Football" },
  { id: "gaelic-football", name: "Gaelic Football" },
  { id: "golf", name: "Golf" },
  { id: "ice-hockey", name: "Ice Hockey" },
  { id: "judo", name: "Judo" },
  { id: "lacrosse", name: "Lacrosse" },
  { id: "rowing", name: "Rowing" },
  { id: "rugby", name: "Rugby" },
  { id: "running", name: "Running" },
  { id: "soccer", name: "Soccer" },
  { id: "softball", name: "Softball" },
  { id: "swimming", name: "Swimming" },
  { id: "tennis", name: "Tennis" },
  { id: "track-field", name: "Track & Field" },
  { id: "ultimate-frisbee", name: "Ultimate Frisbee" },
  { id: "volleyball", name: "Volleyball" },
  { id: "other", name: "Other" },
];

export const SCHOOL_CLUBS: Activity[] = [
  { id: "accounting", name: "Accounting" },
  { id: "african-caribbean", name: "African & Caribbean Students" },
  { id: "asl", name: "American Sign Language" },
  { id: "art", name: "Art" },
  { id: "asian", name: "Asian Students" },
  { id: "biology", name: "Biology" },
  { id: "black-student-union", name: "Black Student Union" },
  { id: "business", name: "Business" },
  { id: "consulting", name: "Consulting" },
  { id: "dance", name: "Dance" },
  { id: "economics", name: "Economics" },
  { id: "engineering-robotics", name: "Engineering & Robotics" },
  { id: "entertainment", name: "Entertainment" },
  { id: "film", name: "Film" },
  { id: "first-generation", name: "First Generation Students" },
  { id: "gaming-tabletop", name: "Gaming & Tabletop" },
  { id: "greek-life", name: "Greek Life" },
  { id: "health-wellness", name: "Health & Wellness" },
  { id: "international", name: "International Students" },
  { id: "italian", name: "Italian" },
  { id: "jewish", name: "Jewish Students" },
  { id: "law", name: "Law" },
  { id: "latinx", name: "Latinx Students" },
  { id: "marketing", name: "Marketing" },
  { id: "medical-pre-medical", name: "Medical / Pre-Medical" },
  { id: "mental-health", name: "Mental Health" },
  { id: "middle-eastern", name: "Middle Eastern Students" },
  { id: "music", name: "Music" },
  { id: "nursing", name: "Nursing" },
  { id: "occupational-therapy", name: "Occupational Therapy" },
  { id: "pharmacy", name: "Pharmacy" },
  { id: "physical-therapy", name: "Physical Therapy" },
  { id: "pilipino-cultural", name: "Pilipino Cultural" },
  { id: "political-government", name: "Political / Government" },
  { id: "psychology", name: "Psychology" },
  { id: "religious-christian", name: "Religious / Christian" },
  { id: "service-volunteer", name: "Service & Volunteer" },
  { id: "speech-debate", name: "Speech & Debate" },
  { id: "sports-analytics", name: "Sports Analytics" },
  { id: "sports-marketing", name: "Sports Marketing" },
  { id: "theater", name: "Theater" },
  { id: "womens-organizations", name: "Women's Organizations" },
  { id: "lgbtq-pride", name: "LGBTQ+ / Pride" },
  { id: "student-government", name: "Student Government" },
  { id: "sustainability-environmental", name: "Sustainability / Environmental" },
  { id: "veterans-military", name: "Veterans / Military" },
  { id: "writing-literature", name: "Writing & Literature" },
  { id: "other", name: "Other" },
];

export function activityName(orgCat: string, id: string) {
  const list = orgCat === "club" ? SCHOOL_CLUBS : SPORTS_TEAMS;
  return list.find((a) => a.id === id)?.name ?? id;
}
