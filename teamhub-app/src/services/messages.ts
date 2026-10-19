// Messaging (proposed schema — the messaging lead owns the final version).
//   conversations/{id}            { participants[], participantNames{}, teamId, title, lastMessage, updatedAt }
//   conversations/{id}/messages   { senderId, senderName, text, createdAt }
// Pages only talk to these functions, so swapping in Cloud Functions or a
// different schema later means editing this file only.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toDate } from "../lib/format";
import type { Conversation, Message, UserProfile } from "../types";

function toConversation(id: string, data: Record<string, unknown>): Conversation {
  return {
    id,
    participants: (data.participants as string[]) ?? [],
    participantNames: (data.participantNames as Record<string, string>) ?? {},
    teamId: (data.teamId as string) ?? null,
    title: (data.title as string) ?? null,
    lastMessage: (data.lastMessage as string) ?? "",
    updatedAt: toDate(data.updatedAt),
  };
}

/** Live list of the signed-in person's conversations, newest first. */
export function watchConversations(uid: string, cb: (list: Conversation[]) => void) {
  const q = query(collection(db, "conversations"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => toConversation(d.id, d.data()));
    list.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
    cb(list);
  });
}

export function watchMessages(conversationId: string, cb: (list: Message[]) => void) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
    limit(200),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          createdAt: toDate(data.createdAt),
        };
      }),
    );
  });
}

export async function sendMessage(
  conversationId: string,
  sender: { uid: string; name: string },
  text: string,
) {
  const clean = text.trim();
  if (!clean) return;
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId: sender.uid,
    senderName: sender.name,
    text: clean,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: clean,
    updatedAt: serverTimestamp(),
  });
}

/** Opens (or creates) the one-to-one thread between two people. */
export async function openDirectConversation(
  me: { uid: string; name: string },
  other: { uid: string; name: string },
) {
  const id = [me.uid, other.uid].sort().join("_");
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      teamId: null,
      title: null,
      lastMessage: "",
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

/** People you can start a conversation with (simple search by name/username). */
export async function searchPeople(term: string, excludeUid: string): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  const t = term.trim().toLowerCase();
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }))
    .filter((u) => u.uid !== excludeUid)
    .filter(
      (u) =>
        !t ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(t) ||
        (u.username ?? "").includes(t),
    )
    .slice(0, 8);
}
