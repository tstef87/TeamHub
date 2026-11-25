import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const TEAMS_COLLECTION = "teams";
const ROSTER_COLLECTION = "roster";

// Team roles. "other" lets the admin type a custom role name.
export const ROSTER_ROLES = [
  { value: "coach", label: "Coach" },
  { value: "leader", label: "Team Leader" },
  { value: "player", label: "Player" },
  { value: "member", label: "Member" },
  { value: "other", label: "Other" },
];

// Roles that get a Message button on the roster.
export const CONTACT_ROLES = ["coach", "leader"];

// Display label for a roster entry's role.
export function roleLabel(member) {
  if (member.role === "other") return member.customRole || "Other";
  return ROSTER_ROLES.find((r) => r.value === member.role)?.label ?? "Member";
}

const rosterRef = (teamId) =>
  collection(db, TEAMS_COLLECTION, teamId, ROSTER_COLLECTION);

const memberRef = (teamId, memberId) =>
  doc(db, TEAMS_COLLECTION, teamId, ROSTER_COLLECTION, memberId);

const requireUser = () => {
  if (!auth.currentUser) throw new Error("You must be logged in to edit the roster.");
};

// Trim a string; return null if empty.
const cleanText = (value) => {
  const text = (value ?? "").toString().trim();
  return text || null;
};

// Validate and normalize roster form input. Shared by add and update.
function cleanMember({ name, email, role, customRole, position, number }) {
  const cleanName = cleanText(name);
  if (!cleanName) throw new Error("Name is required.");

  if (!ROSTER_ROLES.some((r) => r.value === role)) {
    throw new Error("Please choose a role.");
  }

  const cleanCustomRole = role === "other" ? cleanText(customRole) : null;
  if (role === "other" && !cleanCustomRole) {
    throw new Error("Please enter a role name.");
  }

  let cleanNumber = null;
  if (number !== undefined && number !== null && `${number}`.trim() !== "") {
    cleanNumber = Number(number);
    if (!Number.isInteger(cleanNumber) || cleanNumber < 0) {
      throw new Error("Number must be a whole number.");
    }
  }

  return {
    name: cleanName,
    email: cleanText(email)?.toLowerCase() ?? null,
    role,
    customRole: cleanCustomRole,
    position: cleanText(position),
    number: cleanNumber,
  };
}

// duplicate check
async function assertNotOnRoster(teamId, { uid, username, email }, ignoreId = null) {
  const checks = [
    uid && { field: "uid", value: uid, message: "That person is already on the roster." },
    username && { field: "username", value: username, message: `@${username} is already on the roster.` },
    email && { field: "email", value: email, message: `${email} is already on the roster.` },
  ].filter(Boolean);

  for (const { field, value, message } of checks) {
    const snap = await getDocs(query(rosterRef(teamId), where(field, "==", value), limit(2)));
    if (snap.docs.some((d) => d.id !== ignoreId)) throw new Error(message);
  }
}

// Get Team Roster 
export async function getRoster(teamId) {
  const q = query(rosterRef(teamId), orderBy("addedAt", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      addedAt: data.addedAt?.toDate?.() ?? null,
    };
  });
}

// Add to roster
export async function addRosterMember(teamId, input) {
  requireUser();

  const member = cleanMember(input);
  const uid = input.uid ?? null;
  const username = cleanText(input.username);

  await assertNotOnRoster(teamId, { uid, username, email: member.email });

  const ref = await addDoc(rosterRef(teamId), {
    ...member,
    uid,
    username,
    addedAt: serverTimestamp(),
  });

  return ref.id;
}

// Edit Roster Entry
export async function updateRosterMember(teamId, memberId, input) {
  requireUser();

  const member = cleanMember(input);
  const link =
    input.uid !== undefined
      ? { uid: input.uid ?? null, username: cleanText(input.username) }
      : {};

  await assertNotOnRoster(teamId, { ...link, email: member.email }, memberId);

  await updateDoc(memberRef(teamId, memberId), {
    ...member,
    ...link,
    editedAt: serverTimestamp(),
  });
}


// Remove from roster.
export async function removeRosterMember(teamId, memberId) {
  requireUser();
  await deleteDoc(memberRef(teamId, memberId));
}