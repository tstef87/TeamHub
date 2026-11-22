// src/firestore/Teams.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,          // needed by getTeamEvents
  runTransaction,   // needed by createTeam
  // serverTimestamp,  // re-enable with createdAt below
} from "firebase/firestore";
// import { auth, db } from "../firebase";
import { db } from "../firebase";

export const TEAMS_COLLECTION = "teams";

export const normalizeName = (name) => (name ?? "").trim().toLowerCase();

// Cleans Team Name for DB ID
export const teamIdFromName = (name) =>
  normalizeName(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Checks to see if Team name exists before adding Team
export async function teamNameExists(name) {
  const id = teamIdFromName(name);
  if (!id) return false;
  const snap = await getDoc(doc(db, TEAMS_COLLECTION, id));
  return snap.exists();
}

// Get Team info
export async function getTeam(id) {
  const snap = await getDoc(doc(db, TEAMS_COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getTeams() {
  const snap = await getDocs(collection(db, TEAMS_COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get Team Calendar
export async function getTeamEvents(id) {
  const q = query(
    collection(db, TEAMS_COLLECTION, id, "events"),
    orderBy("start")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createTeam({ name, description = "", org_cat = "",
  org = "", events = [], members = [], admins = [] }) {
  if (!admins.length) throw new Error("A team needs at least one admin.");

  const cleanName = (name ?? "").trim();
  if (!cleanName) throw new Error("Team name is required.");

  const id = teamIdFromName(cleanName);
  if (!id) throw new Error("Team name must include letters or numbers.");

  // One transaction can commit the team and its calendar together.
  // Fail before writing anything rather than leave a team with missing events.
  const MAX_EVENTS = 499; // 500 writes total, including the team document
  if (events.length > MAX_EVENTS) {
    throw new Error(`Calendar has too many events (maximum ${MAX_EVENTS}).`);
  }

  const teamRef = doc(db, TEAMS_COLLECTION, id);

  // Check name uniqueness and save all documents atomically.
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(teamRef);
    if (snap.exists()) throw new Error("A team with that name already exists.");
    tx.set(teamRef, {
      name: cleanName,
      description: description.trim(),
      org_cat,
      org,
      members,
      admins,// array of user uids; the creator is the first admin
      followers: 0,
      // ownerId: user.uid,
      // ownerEmail: user.email,
      // createdAt: serverTimestamp(),
    });
    for (const ev of events) {
      tx.set(doc(collection(db, TEAMS_COLLECTION, id, "events")), ev);
    }
  });

  return id;
}