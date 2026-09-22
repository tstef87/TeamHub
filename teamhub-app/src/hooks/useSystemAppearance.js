import { useState, useEffect } from "react";

export function useSystemAppearance() {
  const getPreference = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [appearance, setAppearance] = useState(getPreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setAppearance(getPreference());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return appearance;
}