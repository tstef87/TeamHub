import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { fullName } from "../lib/format";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

const ALLOWED_DOMAIN = "@sju.edu";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // the users/{username} doc from Firestore
  const [loading, setLoading] = useState(true); // true until Firebase reports the first auth state

  useEffect(() => {
    let active = true;
    let requestId = 0;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentRequest = ++requestId;
      setLoading(true);

      // Only @sju.edu accounts are allowed in
      if (firebaseUser && !firebaseUser.email?.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
        try {
          await firebaseSignOut(auth);
        } catch (err) {
          console.error("Couldn't sign out account:", err);
        }
        firebaseUser = null;
      }

      let userDoc = null;
      if (firebaseUser) {
        try {
          // Sign-up stores users/{username}, not users/{uid}.
          const snap = await getDocs(query(
            collection(db, "users"),
            where("uid", "==", firebaseUser.uid),
            limit(1),
          ));
          userDoc = snap.empty ? null : { ...snap.docs[0].data(), username: snap.docs[0].id };
        } catch (err) {
          console.error("Couldn't load user profile:", err);
        }
      }

      // Ignore profile fetches that finish after a logout or a new auth event.
      if (!active || currentRequest !== requestId) return;
      setUser(firebaseUser);
      setProfile(userDoc);
      setLoading(false);
    });
    return () => {
      active = false;
      requestId++;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    displayName: fullName(profile) || user?.displayName || user?.email || "",
    signOut: () => firebaseSignOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}