import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const TEAMS_COLLECTION = "teams";
const ANNOUNCEMENTS_COLLECTION = "announcements";
const MAX_PINNED = 3;

const announcementsRef = (teamId) =>
  collection(db, TEAMS_COLLECTION, teamId, ANNOUNCEMENTS_COLLECTION);

// Retrieve announcements, with pinned posts first and newest posts next.
export async function getAnnouncements(teamId) {
  const q = query(
    announcementsRef(teamId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const announcements = snap.docs.map((d) => {
    const data = d.data();

    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });

  return announcements.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      b.createdAt - a.createdAt
  );
}

// Create an announcement for the currently authenticated user.
export async function postAnnouncement(teamId, { title, body }) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to post an announcement.");
  }

  const cleanTitle = title.trim();
  const cleanBody = body.trim();

  if (!cleanTitle || !cleanBody) {
    throw new Error("A title and message are required.");
  }

  // Get the author's name from their Firestore profile.
  const userSnap = await getDoc(doc(db, "users", user.uid));
  const profile = userSnap.exists() ? userSnap.data() : {};

  const authorName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    user.displayName ||
    user.email ||
    "Unknown user";

  await addDoc(announcementsRef(teamId), {
    title: cleanTitle,
    body: cleanBody,
    authorId: user.uid,
    authorName,
    createdAt: serverTimestamp(),
    pinned: false,
  });
}

// Pin or unpin an announcement, enforcing the three-post limit.


export async function setAnnouncementPinned(teamId, announcementId, pinned) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  const announcementRef = doc(
    db,
    TEAMS_COLLECTION,
    teamId,
    ANNOUNCEMENTS_COLLECTION,
    announcementId
  );

  // Check the existing count for older teams without a counter.
  const teamSnap = await getDoc(teamRef);

  if (!teamSnap.exists()) {
    throw new Error("Team not found.");
  }

  let legacyPinnedCount = 0;

  if (typeof teamSnap.data().pinnedAnnouncementCount !== "number") {
    const pinnedQuery = query(
      announcementsRef(teamId),
      where("pinned", "==", true)
    );

    const pinnedSnap = await getDocs(pinnedQuery);
    legacyPinnedCount = pinnedSnap.size;
  }

  await runTransaction(db, async (transaction) => {
    // Only document references are read inside this transaction.
    const currentTeamSnap = await transaction.get(teamRef);
    const currentAnnouncementSnap = await transaction.get(announcementRef);

    if (!currentTeamSnap.exists() || !currentAnnouncementSnap.exists()) {
      throw new Error("Team or announcement not found.");
    }

    const teamData = currentTeamSnap.data();
    const currentPinned = currentAnnouncementSnap.data().pinned === true;

    if (currentPinned === pinned) return;

    const currentCount =
      typeof teamData.pinnedAnnouncementCount === "number"
        ? teamData.pinnedAnnouncementCount
        : legacyPinnedCount;

    if (pinned && currentCount >= MAX_PINNED) {
      throw new Error("PIN_LIMIT_REACHED");
    }

    const nextCount = Math.max(
      0,
      currentCount + (pinned ? 1 : -1)
    );

    transaction.update(announcementRef, { pinned });
    transaction.update(teamRef, {
      pinnedAnnouncementCount: nextCount,
    });
  });
}


// Edit an announcement. Only its original author can edit it.
export async function editAnnouncement(teamId, announcementId, { title, body }) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const cleanTitle = title.trim();
  const cleanBody = body.trim();

  if (!cleanTitle || !cleanBody) {
    throw new Error("TITLE_AND_BODY_REQUIRED");
  }

  const announcementRef = doc(
    db,
    TEAMS_COLLECTION,
    teamId,
    ANNOUNCEMENTS_COLLECTION,
    announcementId
  );

  await runTransaction(db, async (transaction) => {
    const announcementSnap = await transaction.get(announcementRef);

    if (!announcementSnap.exists()) {
      throw new Error("ANNOUNCEMENT_NOT_FOUND");
    }

    if (announcementSnap.data().authorId !== user.uid) {
      throw new Error("NOT_ANNOUNCEMENT_AUTHOR");
    }

    transaction.update(announcementRef, {
      title: cleanTitle,
      body: cleanBody,
      editedAt: serverTimestamp(),
    });
  });
}


// Delete an announcement. Only its original author can delete it.
export async function deleteAnnouncement(teamId, announcementId) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const teamRef = doc(db, TEAMS_COLLECTION, teamId);

  const announcementRef = doc(
    db,
    TEAMS_COLLECTION,
    teamId,
    ANNOUNCEMENTS_COLLECTION,
    announcementId
  );

  // Support older teams that don't have a pinned counter yet.
  const teamSnap = await getDoc(teamRef);

  if (!teamSnap.exists()) {
    throw new Error("TEAM_NOT_FOUND");
  }

  let legacyPinnedCount = 0;

  if (typeof teamSnap.data().pinnedAnnouncementCount !== "number") {
    const pinnedQuery = query(
      announcementsRef(teamId),
      where("pinned", "==", true)
    );

    const pinnedSnap = await getDocs(pinnedQuery);
    legacyPinnedCount = pinnedSnap.size;
  }

  await runTransaction(db, async (transaction) => {
    const currentTeamSnap = await transaction.get(teamRef);
    const announcementSnap = await transaction.get(announcementRef);

    if (!currentTeamSnap.exists() || !announcementSnap.exists()) {
      throw new Error("ANNOUNCEMENT_NOT_FOUND");
    }

    const announcement = announcementSnap.data();

    if (announcement.authorId !== user.uid) {
      throw new Error("NOT_ANNOUNCEMENT_AUTHOR");
    }

    if (announcement.pinned === true) {
      const teamData = currentTeamSnap.data();

      const currentCount =
        typeof teamData.pinnedAnnouncementCount === "number"
          ? teamData.pinnedAnnouncementCount
          : legacyPinnedCount;

      transaction.update(teamRef, {
        pinnedAnnouncementCount: Math.max(0, currentCount - 1),
      });
    }

    transaction.delete(announcementRef);
  });
}