// Prefix tokens so Firestore can do "starts with" search on any word.
// "Troy Stefano" -> ["t","tr","tro","troy","s","st",...,"troy stefano"...]
export const MAX_PREFIX = 15;

export function buildSearchTokens(...values) {
  const tokens = new Set();
  values
    .filter(Boolean)
    .map((v) => v.toLowerCase().trim())
    .flatMap((v) => [v, ...v.split(/[\s@._-]+/)])
    .filter(Boolean)
    .forEach((word) => {
      for (let i = 1; i <= Math.min(word.length, MAX_PREFIX); i++) {
        tokens.add(word.slice(0, i));
      }
    });
  return [...tokens];
}