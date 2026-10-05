// scripts/ensure-deps.mjs
// Scans src/ for package imports and installs any that are missing,
// so "Failed to resolve import" errors for npm packages go away.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { builtinModules } from "node:module";
import { execSync } from "node:child_process";

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
]);

// Packages that must come along with another one (peer dependencies).
const COMPANIONS = {
  "@mui/material": ["@emotion/react", "@emotion/styled"],
};

const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) yield full;
  }
}

function packageName(spec) {
  if (
    spec.startsWith(".") ||
    spec.startsWith("/") ||
    spec.startsWith("@/") ||
    spec.startsWith("~") ||
    spec.startsWith("node:") ||
    spec.startsWith("virtual:")
  ) {
    return null;
  }
  const parts = spec.split("/");
  const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  return builtinModules.includes(name) ? null : name;
}

const used = new Set();
const srcDir = join(root, "src");
if (existsSync(srcDir)) {
  for (const file of walk(srcDir)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(IMPORT_RE)) {
      const name = packageName(m[1] ?? m[2]);
      if (name) used.add(name);
    }
  }
}

for (const [name, extras] of Object.entries(COMPANIONS)) {
  if (used.has(name) || declared.has(name)) extras.forEach((e) => used.add(e));
}

const missing = [...used].filter((name) => !declared.has(name));
const notInstalled = [...declared].filter(
  (name) => !existsSync(join(root, "node_modules", name))
);

if (missing.length) {
  console.log(`Installing missing packages: ${missing.join(", ")}`);
  execSync(`npm install ${missing.join(" ")}`, { stdio: "inherit" });
} else if (notInstalled.length) {
  console.log("Some declared packages are not installed. Running npm install...");
  execSync("npm install", { stdio: "inherit" });
} else {
  console.log("Dependencies OK.");
}
