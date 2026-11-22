import { useEffect, useState } from "react";
import { searchUsers } from "../firestore/Users";

export default function useUserSearch(term, { delay = 250, max = 8 } = {}) {
  const [state, setState] = useState({ term: "", results: [] });
  const q = term.trim();
  const active = q.length >= 2;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const t = setTimeout(() => {
      searchUsers(q, { max })
        .catch((e) => { console.error(e); return []; })
        .then((results) => !cancelled && setState({ term: q, results }));
    }, delay);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, active, delay, max]);

  return {
    results: active && state.term === q ? state.results : [],
    loading: active && state.term !== q,
  };
}