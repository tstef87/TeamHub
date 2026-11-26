import {
  collection,
  doc,
  documentId,
  endAt,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// Conversations Expire 5 days after sent 
// Used to Conserve DB sapce 
const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
const fiveDaysFromNow = () => Timestamp.fromMillis(Date.now() + FIVE_DAYS);
const notExpired = (data) => !data.expireAt || data.expireAt.toMillis() > Date.now();

export const CONV_COLLECTION = "messages";

// Same id for both people, so a chat between two users is always the same document
export const directConversationId = (a, b) => "dm_" + [a, b].sort().join("_");

// Creates the conversation (if it doesn't exist yet) and sends the first message
export async function sendFirstMessage(me, other, text) {
  const id = directConversationId(me.uid, other.uid);
  const ref = doc(db, CONV_COLLECTION, id);

  if (!(await getDoc(ref)).exists()) {
    await setDoc(ref, {
      title: "",
      participants: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      lastMessage: "",
      updatedAt: serverTimestamp(),
      expireAt: fiveDaysFromNow(),
    });
  }

  await sendMessage(id, me, text);
  return id;
}

// Find or create a 1-on-1 conversation
// ID is the same for both parties 
export async function openDirectConversation(me, other) {
  const id = "dm_" + [me.uid, other.uid].sort().join("_");
  const ref = doc(db, CONV_COLLECTION, id);
  if (!(await getDoc(ref)).exists()) {
    await setDoc(ref, {
      title: "",
      participants: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      lastMessage: "",
      updatedAt: serverTimestamp(),
      expireAt: fiveDaysFromNow(),
    });
  }
  return id;
}

// Group Chats 
// Reserved for teams only  
export async function openTeamChat(team) {
  const id = "gc_" + [team];
  const ref = doc(db, CONV_COLLECTION, id);
  if (!(await getDoc(ref)).exists()) {
    await setDoc(ref, {
      title: "",
      participants: [me.uid, other.uid],
      participantNames: { [me.uid]: me.name, [other.uid]: other.name },
      lastMessage: "",
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

// Live list of conversations
   // keep your existing mapping
export function watchConversations(uid, callback) {
  const q = query(collection(db, CONV_COLLECTION), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const convs = snap.docs
      .filter((d) => notExpired(d.data()))
      .map((d) => ({
      id: d.id,
      ...d.data(),
      updatedAt: d.data().updatedAt?.toDate() ?? new Date(),
    }));
    convs.sort((a, b) => b.updatedAt - a.updatedAt);
    callback(convs);
  });
}

// Live messages in one conversation, oldest first
export function watchMessages(conversationId, callback) {
  const q = query(collection(db, CONV_COLLECTION, conversationId, "messages"), orderBy("createdAt"));
  return onSnapshot(q, (snap) =>
    callback(snap.docs.filter((d) => notExpired(d.data())).map((d) => ({ id: d.id, ...d.data() })))
  );}

// Save a message and update the conversation preview
export async function sendMessage(conversationId, sender, text) {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, CONV_COLLECTION, conversationId, "messages")), {
    senderId: sender.uid,
    senderName: sender.name,
    text,
    createdAt: serverTimestamp(),
    expireAt: fiveDaysFromNow(),
  });
  batch.update(doc(db, CONV_COLLECTION, conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    expireAt: fiveDaysFromNow(),
  });
  await batch.commit();
}

// Delete my conversations whose expireAt has passed, along with their messages.
export async function deleteExpiredConversations(uid) {
  const snap = await getDocs(
    query(collection(db, CONV_COLLECTION), where("participants", "array-contains", uid))
  );
  const expired = snap.docs.filter((d) => !notExpired(d.data()));

  for (const conv of expired) {
    // Delete the messages subcollection first; deleting the parent doesn't remove it
    const msgs = await getDocs(collection(conv.ref, "messages"));
    for (let i = 0; i < msgs.docs.length; i += 500) {
      const batch = writeBatch(db);
      msgs.docs.slice(i, i + 500).forEach((m) => batch.delete(m.ref));
      await batch.commit();
    }
    // Then the conversation itself
    const batch = writeBatch(db);
    batch.delete(conv.ref);
    await batch.commit();
  }
}