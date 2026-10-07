// src/firestore/teams.js
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  // serverTimestamp,  // re-enable with createdAt below
} from "firebase/firestore";
import { auth, db } from "../firebase";

export const TEAMS_COLLECTION = "teams";

export async function createTeam({ name, description = "", org_cat = "", 
  org = "" }) {
  //   const user = auth.currentUser;
  //   if (!user) throw new Error("You must be signed in to create a team.");

  const cleanName = (name ?? "").trim();
  if (!cleanName) throw new Error("Team name is required.");

  const ref = await addDoc(collection(db, TEAMS_COLLECTION), {
    name: cleanName,
    description: description.trim(),
    org_cat,
    org,
    // ownerId: user.uid,
    // ownerEmail: user.email,
    // createdAt: serverTimestamp(),
  });

  return ref.id;
}