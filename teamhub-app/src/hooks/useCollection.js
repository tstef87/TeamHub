import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useCollection(name) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, name));
        if (!cancelled) {
          setRows(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name]);

  return { rows, loading };
}