const fs = require("fs");
const path = require("path");

const SKIP_FIELDS = new Set(["moduleFilePath", "codePath", "_randomUID", 'methodology', ]);

const currentPath = path.join(__dirname, "tvlModules.json");
const safePath = path.join(__dirname, "..", "tvlModules_safe.json.log");

if (!fs.existsSync(currentPath)) {
  console.error("tvlModules.json not found. Run buildModules first.");
  process.exit(1);
}
if (!fs.existsSync(safePath)) {
  console.error("tvlModules_safe.json.log not found.");
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(currentPath, "utf8"));
const safe = JSON.parse(fs.readFileSync(safePath, "utf8"));

const ignoredAdapters = ['maxapy/index.js', 'kasu/index.js', 'vestige/index.js']

ignoredAdapters.forEach((key) => {
  delete current[key];
  delete safe[key];
})

let missingCount = 0;
let extraCount = 0;
let diffCount = 0;

// --- 1. Missing & extra keys ---
console.log("=".repeat(80));
console.log("MISSING & EXTRA KEYS (comparing tvlModules.json against safe.json.log)");
console.log("=".repeat(80));

const safeKeys = new Set(Object.keys(safe));
const currentKeys = new Set(Object.keys(current));

const missingFromCurrent = [...safeKeys].filter((k) => !currentKeys.has(k));
const extraInCurrent = [...currentKeys].filter((k) => !safeKeys.has(k));

if (missingFromCurrent.length > 0) {
  console.log(`\nMissing from current build (${missingFromCurrent.length}):`);
  for (const k of missingFromCurrent.sort()) {
    console.log(`  - ${k}`);
    missingCount++;
  }
}

/* 
if (extraInCurrent.length > 0) {
  console.log(`\nNew in current build (${extraInCurrent.length}):`);
  for (const k of extraInCurrent.sort()) {
    console.log(`  + ${k}`);
    extraCount++;
  }
} */

// --- 2. Deep comparison ---
console.log("\n" + "=".repeat(80));
console.log("VALUE DIFFERENCES (skipping moduleFilePath, codePath, _randomUID)");
console.log("=".repeat(80));

function deepCompare(a, b, path) {
  const diffs = [];

  if (a === b) return diffs;

  if (a === null || b === null || typeof a !== typeof b) {
    diffs.push({ path, safe: a, current: b });
    return diffs;
  }

  if (typeof a !== "object") {
    if (a !== b) {
      diffs.push({ path, safe: a, current: b });
    }
    return diffs;
  }

  // Both are objects/arrays
  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);
  if (isArrayA !== isArrayB) {
    diffs.push({ path, safe: a, current: b });
    return diffs;
  }

  if (isArrayA) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= a.length) {
        diffs.push({ path: `${path}[${i}]`, safe: undefined, current: b[i] });
      } else if (i >= b.length) {
        diffs.push({ path: `${path}[${i}]`, safe: a[i], current: undefined });
      } else {
        diffs.push(...deepCompare(a[i], b[i], `${path}[${i}]`));
      }
    }
    return diffs;
  }

  // Object comparison
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    if (SKIP_FIELDS.has(key)) continue;

    const childPath = path ? `${path}.${key}` : key;

    if (!(key in a)) {
      diffs.push({ path: childPath, safe: undefined, current: b[key] });
    } else if (!(key in b)) {
      diffs.push({ path: childPath, safe: a[key], current: undefined });
    } else {
      diffs.push(...deepCompare(a[key], b[key], childPath));
    }
  }

  return diffs;
}

const commonKeys = Object.keys(safe).filter((k) => k in current);
const adaptersWithDiffs = [];

for (const key of commonKeys.sort()) {
  let diffs = deepCompare(safe[key], current[key], key);
  const ignoredPatterns = (str) =>
    ["misrepresentedTokens", 'timetravel', 'start'].some(
      (i) => str.includes(i)
    );
  diffs = diffs.filter(
    (i) =>
      i.safe !== undefined &&
      !i.path.endsWith("pullHourly") &&
      !ignoredPatterns(i.path)
  );
  if (diffs.length > 0) {
    adaptersWithDiffs.push({ key, diffs });
  }
}

if (adaptersWithDiffs.length > 0) {
  console.log(`\n${adaptersWithDiffs.length} adapter(s) with differences:`);
  for (const { key, diffs } of adaptersWithDiffs) {
    console.log(`\n  ${key}:`);
    for (const d of diffs) {
      const safeFmt = fmt(d.safe);
      const currFmt = fmt(d.current);

      console.log(`    ${d.path}`);
      console.log(`      safe:    ${safeFmt}`);
      console.log(`      current: ${currFmt}`);
      diffCount++;
    }
  }
}

// --- Summary ---
console.log("\n" + "=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`  Missing from current build : ${missingCount}`);
console.log(`  New in current build       : ${extraCount}`);
console.log(`  Value differences          : ${diffCount}`);

function fmt(v) {
  if (v === undefined) return "(missing)";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}