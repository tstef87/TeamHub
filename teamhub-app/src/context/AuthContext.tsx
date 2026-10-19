import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { fullName } from "../lib/format";
import type { Role, UserProfile } from "../types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: Role;
  displayName: string;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  role: "follower",
  displayName: "",
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopProfile: (() => void) | undefined;
    const stopAuth = onAuthStateChanged(auth, (u) => {
      stopProfile?.();
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Keep the profile live so follows / role changes show up immediately.
      stopProfile = onSnapshot(
        doc(db, "users", u.uid),
        (snap) => {
          setProfile(
            snap.exists() ? ({ uid: u.uid, ...snap.data() } as UserProfile) : null,
          );
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        },
      );
    });
    return () => {
      stopProfile?.();
      stopAuth();
    };
  }, []);

  const value: AuthState = {
    user,
    profile,
    role: profile?.role ?? "follower",
    displayName: fullName(profile) || user?.email || "",
    loading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
