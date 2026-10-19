// Teams — ported from src/firestore/Teams.js (same ids, fields and events
// subcollection), plus follow/unfollow, roster and announcements.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { toDate } from "../lib/format";
import type { Announcement, RosterEntry, Team, TeamEvent } from "../types";

export const TEAMS_COLLECTION = "teams";

export const normalizeName = (name: string) => (name ?? "").trim().toLowerCase();

/** Cleans a team name into its document id, e.g. "Ice Hockey" -> "ice-hockey". */
export const teamIdFromName = (name: string) =>
  normalizeName(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function teamNameExists(name: string) {
  const id = teamIdFromName(name);
  if (!id) return false;
  const snap = await getDoc(doc(db, TEAMS_COLLECTION, id));
  return snap.exists();
}

export async function listTeams(): Promise<Team[]> {
  const snap = await getDocs(collection(db, TEAMS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Team, "id">) }));
}

export async function getTeam(id: string): Promise<Team | null> {
  const snap = await getDoc(doc(db, TEAMS_COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Team, "id">) } : null;
}

export async function getTeamEvents(id: string): Promise<TeamEvent[]> {
  const q = query(collection(db, TEAMS_COLLECTION, id, "events"), orderBy("start"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TeamEvent) }));
}

export interface NewTeam {
  name: string;
  description?: string;
  org_cat?: string;
  org?: string;
  events?: TeamEvent[];
  ownerId?: string;
}

export async function createTeam({
  name,
  description = "",
  org_cat = "",
  org = "",
  events = [],
  ownerId,
}: NewTeam) {
  const cleanName = (name ?? "").trim();
  if (!cleanName) throw new Error("Team name is required.");

  const id = teamIdFromName(cleanName);
  if (!id) throw new Error("Team name must include letters or numbers.");

  const teamRef = doc(db, TEAMS_COLLECTION, id);

  // The transaction makes the exists-check and the write one atomic step.
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(teamRef);
    if (snap.exists()) throw new Error("A team with that name already exists.");
    tx.set(teamRef, {
      name: cleanName,
      description: description.trim(),
      org_cat,
      org,
      followers: 0,
      ...(ownerId ? { ownerId } : {}),
    });
  });

  for (let i = 0; i < events.length; i += 500) {
    const batch = writeBatch(db);
    events.slice(i, i + 500).forEach((ev) => {
      batch.set(doc(collection(db, TEAMS_COLLECTION, id, "events")), ev);
    });
    await batch.commit();
  }

  return id;
}

// ---------- Following (proposed) ----------

export async function followTeam(uid: string, teamId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", uid), { followedTeams: arrayUnion(teamId) });
  batch.update(doc(db, TEAMS_COLLECTION, teamId), { followers: increment(1) });
  await batch.commit();
}

export async function unfollowTeam(uid: string, teamId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", uid), { followedTeams: arrayRemove(teamId) });
  batch.update(doc(db, TEAMS_COLLECTION, teamId), { followers: increment(-1) });
  await batch.commit();
}

// ---------- Roster (proposed) ----------

export async function getRoster(teamId: string): Promise<RosterEntry[]> {
  const snap = await getDocs(collection(db, TEAMS_COLLECTION, teamId, "roster"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RosterEntry, "id">) }));
}

/** Adds invited emails from the Create Team form as pending roster entries. */
export async function addRosterInvites(teamId: string, emails: string[]) {
  if (!emails.length) return;
  const batch = writeBatch(db);
  emails.forEach((email) => {
    batch.set(doc(collection(db, TEAMS_COLLECTION, teamId, "roster")), {
      name: email.split("@")[0],
      email: email.toLowerCase(),
      role: "player",
    });
  });
  batch.update(doc(db, TEAMS_COLLECTION, teamId), { members: increment(emails.length) });
  await batch.commit();
}

// ---------- Announcements (proposed) ----------

export async function getAnnouncements(teamId: string): Promise<Announcement[]> {
  const q = query(
    collection(db, TEAMS_COLLECTION, teamId, "announcements"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      body: data.body ?? "",
      pinned: Boolean(data.pinned),
      authorId: data.authorId ?? "",
      authorName: data.authorName ?? "",
      createdAt: toDate(data.createdAt),
    };
  });
}

export async function postAnnouncement(
  teamId: string,
  input: { title: string; body: string; pinned: boolean; authorId: string; authorName: string },
) {
  await addDoc(collection(db, TEAMS_COLLECTION, teamId, "announcements"), {
    ...input,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function setAnnouncementPinned(teamId: string, id: string, pinned: boolean) {
  await updateDoc(doc(db, TEAMS_COLLECTION, teamId, "announcements", id), { pinned });
}
