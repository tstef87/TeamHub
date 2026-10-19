// Auth + account creation. Logic carried over from the team's
// login/create_acc pages so the Firestore writes stay identical:
//   usernames/{username} -> { uid }
//   users/{uid}          -> { firstName, lastName, email, username }
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { Role } from "../types";

export const SJU_DOMAIN = "@sju.edu";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isSjuEmail = (email: string) => normalizeEmail(email).endsWith(SJU_DOMAIN);

/** Firebase error code -> message shown to the person. */
export function authErrorMessage(code: string | undefined) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "That email is already in use.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a minute, then try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, normalizeEmail(email));
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function usernameTaken(username: string) {
  const snap = await getDoc(doc(db, "usernames", username.trim().toLowerCase()));
  return snap.exists();
}

export interface NewAccount {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  /** Proposed: players and fans pick at sign-up; coach access is granted by an admin. */
  role: Exclude<Role, "coach">;
}

export async function createAccount(input: NewAccount) {
  const email = normalizeEmail(input.email);
  const username = input.username.trim().toLowerCase();

  const cred = await createUserWithEmailAndPassword(auth, email, input.password);
  const user = cred.user;

  await setDoc(doc(db, "usernames", username), { uid: user.uid });
  await setDoc(doc(db, "users", user.uid), {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    username,
    role: input.role,
    followedTeams: [],
  });
  return user.uid;
}
