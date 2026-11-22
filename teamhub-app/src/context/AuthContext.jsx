import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

const ALLOWED_DOMAIN = "@sju.edu";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); 
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

      // Only @sju.edu accounts are allowed in
      if (firebaseUser && !firebaseUser.email?.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
        await firebaseSignOut(auth);
        firebaseUser = null;
      }

      let userDoc = null;
      if (firebaseUser) {
        try {
          const snap = await getDocs(query(collection(db, "users"), where("uid", "==", firebaseUser.uid), limit(1)));
          userDoc = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
          } 
        catch (err) {
          console.error("Couldn't load user profile:", err);
        }
      }

      setUser(firebaseUser);
      setProfile(userDoc);
      setLoading(false);
    });
    return unsubscribe; // stop listening when the provider unmounts
  }, []);

  const value = {
    user,
    profile,
    loading,
    displayName: [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.email || "",
    signOut: () => firebaseSignOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}