// Shared data shapes. Fields marked "existing" match what the team's code
// already writes to Firestore. Fields marked "proposed" are new and need a
// thumbs-up from the backend/database leads before they're relied on.

export type Role = "coach" | "player" | "follower";

/** users/{uid} */
export interface UserProfile {
  uid: string;
  firstName: string; // existing
  lastName: string; // existing
  email: string; // existing
  username: string; // existing
  role?: Role; // proposed — treated as "follower" when missing
  followedTeams?: string[]; // proposed — team ids
}

export type OrgCategory = "sport" | "club";

/** teams/{teamId} */
export interface Team {
  id: string;
  name: string; // existing
  description: string; // existing
  org_cat: OrgCategory | string; // existing
  org: string; // existing (activity id, e.g. "ice-hockey")
  followers: number; // existing
  members?: number; // existing column in the Teams table
  ownerId?: string; // existing (commented out in createTeam)
}

/** teams/{teamId}/events/{eventId} — written by CalendarUpload */
export interface TeamEvent {
  id?: string;
  uid: string | null;
  title: string;
  description: string;
  location: string;
  allDay: boolean;
  start: string; // ISO string
  end: string | null; // ISO string
  recurring: boolean;
}

/** teams/{teamId}/announcements/{id} — proposed */
export interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: Date | null;
}

/** teams/{teamId}/roster/{id} — proposed */
export interface RosterEntry {
  id: string;
  name: string;
  email: string;
  role: "coach" | "player";
  number?: string;
  position?: string;
  uid?: string;
}

/** conversations/{id} — proposed */
export interface Conversation {
  id: string;
  participants: string[]; // uids
  participantNames: Record<string, string>;
  teamId?: string | null;
  title?: string | null; // set for team-wide threads
  lastMessage: string;
  updatedAt: Date | null;
}

/** conversations/{id}/messages/{id} — proposed */
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date | null;
}
