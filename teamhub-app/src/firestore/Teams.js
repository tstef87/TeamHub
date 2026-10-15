// src/firestore/Teams.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,          // needed by getTeamEvents
  runTransaction,   // needed by createTeam
  writeBatch,
  // serverTimestamp,  // re-enable with createdAt below
} from "firebase/firestore";
import { auth, db } from "../firebase";

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
  org = "", events = [] }) {
  //   const user = auth.currentUser;
  //   if (!user) throw new Error("You must be signed in to create a team.");

  const cleanName = (name ?? "").trim();
  if (!cleanName) throw new Error("Team name is required.");

  const id = teamIdFromName(cleanName);
  if (!id) throw new Error("Team name must include letters or numbers.");

  const teamRef = doc(db, TEAMS_COLLECTION, id);

  // The transaction makes the exists-check and the write one atomic step
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(teamRef);
    if (snap.exists()) throw new Error("A team with that name already exists.");
    tx.set(teamRef, {
      name: cleanName,
      description: description.trim(),
      org_cat,
      org,
      // members: ['test_user']
      followers: 0,
      // ownerId: user.uid,
      // ownerEmail: user.email,
      // createdAt: serverTimestamp(),
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