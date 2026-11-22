import { collection, getDocs, limit, query, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { buildSearchTokens, MAX_PREFIX } from "../lib/search";

export const USERS_COLLECTION = "users";

// Search users by first/last name, username or email (prefix match).
export async function searchUsers(term, { max = 8 } = {}) {
  const words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length || words[0].length < 2) return [];

  const q = query(
    collection(db, USERS_COLLECTION),
    where("searchTokens", "array-contains", words[0].slice(0, MAX_PREFIX)),
    limit(max * 3),
  );
  const snap = await getDocs(q);

  // Firestore allows only one array-contains, so extra words are filtered here.
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => words.slice(1).every((w) => u.searchTokens?.includes(w.slice(0, MAX_PREFIX))))
    .slice(0, max);
}

// One-time: add searchTokens to users created before this feature.
export async function backfillSearchTokens() {
  const snap = await getDocs(collection(db, USERS_COLLECTION));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    const u = d.data();
    batch.update(d.ref, {
      username: d.id,
      searchTokens: buildSearchTokens(u.firstName, u.lastName, d.id, u.email?.split("@")[0]),
    });
  });
  await batch.commit();
  return snap.size;
}