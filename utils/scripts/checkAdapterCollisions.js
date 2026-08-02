/**
 * Cross-adapter owner-address collision check.
 *
 * Same idea as checkBTCDupsv2.js (bitcoin address book) and checkRegistriesDups.js
 * (registry entries), for the case neither covers: an EVM address that two unrelated
 * projects both claim as a balance target, i.e. "whose balance are we counting as this
 * protocol's own TVL". No single adapter looks wrong on its own, it only shows up when
 * you look at every adapter at once.
 *
 * Usage:
 *   node utils/scripts/checkAdapterCollisions.js
 *   node utils/scripts/checkAdapterCollisions.js --json
 *   node utils/scripts/checkAdapterCollisions.js --changed projects/foo/index.js ...
 *   node utils/scripts/checkAdapterCollisions.js --ack 0xabc... "reason it is not a collision"
 *
 * --changed only looks at the given files against the rest of the repo, so it is cheap
 * enough to run per PR. Nothing is wired to CI right now, it is a manual/scheduled script.
 *
 * An address only counts when it sits in one of these structural positions:
 *   - an `owner` / `owners` value (single string, or array literal)
 *   - the owner slot of a `tokensAndOwners` / `ownerTokens` array of pairs, which is the
 *     LAST element of each inner array
 *   - the owners slot of a `tokensAndOwners2` parallel array, i.e. [tokens, owners]
 * Addresses in a sibling `tokens`/`token` array, or in the token slot of any of the above,
 * are never collected. This is a structural check off the parsed syntax tree, not a
 * keyword-proximity guess, which is what keeps the output at single digits instead of the
 * ~900 candidates a plain "same address mentioned twice" scan produces (a leverage vault
 * referencing Aave's pool address is normal composability, not a double count).
 *
 * Deliberately biased toward false negatives: only string literals in an owner position are
 * resolvable, so a computed or imported owner is skipped rather than guessed at.
 *
 * Parsing uses the Linter API from eslint, which is already a devDependency, so this adds
 * no new package.
 */

const fs = require("fs");
const path = require("path");
const { Linter } = require("eslint");

const ROOT = path.join(__dirname, "..", "..");
const PROJECTS_DIR = path.join(ROOT, "projects");
const DECISIONS_FILE = path.join(__dirname, "adapterCollisionsReviewed.json");

// Not project-owned balances: burn/placeholder addresses and multicall.
const IGNORED_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "0xca11bde05977b3631167028862be2a173976ca11",
]);

// Not protocol adapters: shared code, and the separate treasury/entities namespaces, where
// tracking a protocol's own treasury alongside its TVL is intended rather than a double count.
const SKIP_DIRS = new Set(["helper", "config", "treasury", "entities", "test"]);

const EVM_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

const OWNER_KEYS = new Set(["owner", "owners"]);
const PAIR_ARRAY_KEYS = new Set(["tokensAndOwners", "ownerTokens"]);
const PARALLEL_ARRAY_KEYS = new Set(["tokensAndOwners2"]);

const DOUBLECOUNTED_TRUE_RE = /doublecounted\s*:\s*true/;
const DOUBLECOUNTED_FALSE_RE = /doublecounted\s*:\s*false/;

// An address shared by more than this many projects is shared infrastructure, not a
// two-protocol overlap, and is not worth reporting.
const MAX_PROJECTS_PER_ADDRESS = 6;

const linter = new Linter();

function isAddrLiteral(node) {
  return (
    node &&
    node.type === "Literal" &&
    typeof node.value === "string" &&
    EVM_ADDR_RE.test(node.value)
  );
}

function keyName(node) {
  if (!node || node.type !== "Property") return null;
  const k = node.key;
  if (!k) return null;
  if (k.type === "Identifier" && !node.computed) return k.name;
  if (k.type === "Literal" && typeof k.value === "string") return k.value;
  return null;
}

/**
 * Collect every address literal inside an owner value, recording how many entries the
 * enclosing array had. `context` is what separates "this address is the one owner this
 * adapter tracks" from "this address is one of sixty in a shared list".
 */
function collectAddrsDeep(node, out, context) {
  if (!node) return;
  if (isAddrLiteral(node)) {
    const addr = node.value.toLowerCase();
    const prev = out.get(addr);
    if (prev === undefined || context < prev) out.set(addr, context);
    return;
  }
  if (node.type === "ArrayExpression") {
    const size = node.elements.length;
    for (const el of node.elements) collectAddrsDeep(el, out, size);
  }
}

// tokensAndOwners / ownerTokens: array of inner arrays, owner is each inner array's LAST element.
function collectPairArrayOwners(node, out) {
  if (!node || node.type !== "ArrayExpression") return;
  const pairCount = node.elements.length;
  for (const inner of node.elements) {
    if (!inner || inner.type !== "ArrayExpression" || inner.elements.length === 0) continue;
    collectAddrsDeep(inner.elements[inner.elements.length - 1], out, pairCount);
  }
}

// tokensAndOwners2: [tokensArray, ownersArray], owners is the second top-level element.
function collectParallelArrayOwners(node, out) {
  if (!node || node.type !== "ArrayExpression" || node.elements.length < 2) return;
  collectAddrsDeep(node.elements[1], out, 1);
}

function collectByRole(name, valueNode, out) {
  if (!valueNode) return;
  if (OWNER_KEYS.has(name)) collectAddrsDeep(valueNode, out, 1);
  else if (PAIR_ARRAY_KEYS.has(name)) collectPairArrayOwners(valueNode, out);
  else if (PARALLEL_ARRAY_KEYS.has(name)) collectParallelArrayOwners(valueNode, out);
}

// Addresses found in the file currently being walked. Held outside the rule so the plugin
// and the two configs below can be built once instead of per file.
let currentFileAddrs = new Map();

const collisionPlugin = {
  rules: {
    collect: {
      create() {
        return {
          "*"(node) {
            if (node.type === "Property") {
              const name = keyName(node);
              if (name) collectByRole(name, node.value, currentFileAddrs);
              return;
            }
            if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier") {
              collectByRole(node.id.name, node.init, currentFileAddrs);
              return;
            }
            if (node.type === "AssignmentExpression" && node.operator === "=") {
              const l = node.left;
              let name = null;
              if (l.type === "Identifier") name = l.name;
              else if (l.type === "MemberExpression" && !l.computed && l.property.type === "Identifier")
                name = l.property.name;
              if (name) collectByRole(name, node.right, currentFileAddrs);
            }
          },
        };
      },
    },
  },
};

// Nearly every adapter is CommonJS; a handful use `import`, which needs sourceType module.
const CONFIGS = ["commonjs", "module"].map((sourceType) => ({
  plugins: { collision: collisionPlugin },
  rules: { "collision/collect": "error" },
  languageOptions: { ecmaVersion: "latest", sourceType },
}));

/**
 * Returns Map(address -> smallest enclosing owner-list size seen in this file).
 */
function findOwnerAddresses(text) {
  for (const config of CONFIGS) {
    currentFileAddrs = new Map();
    // A fatal message means the file did not parse under this sourceType.
    if (!linter.verify(text, config).some((m) => m.fatal)) return currentFileAddrs;
  }
  // Still unparseable: skip it rather than crash the run (false-negative bias).
  return new Map();
}

function listAdapterFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".js")) out.push(full);
    }
  }
  return out;
}

// A "project" is a folder under projects/, or a single flat projects/<name>.js adapter.
function listProjects() {
  const out = [];
  for (const name of fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })) {
    if (name.isDirectory()) {
      if (SKIP_DIRS.has(name.name)) continue;
      out.push({ project: name.name, dir: path.join(PROJECTS_DIR, name.name) });
    } else if (name.name.endsWith(".js")) {
      out.push({ project: name.name.replace(/\.js$/, ""), file: path.join(PROJECTS_DIR, name.name) });
    }
  }
  return out;
}

function projectNameFromFile(file) {
  const rel = path.relative(PROJECTS_DIR, path.resolve(file));
  const head = rel.split(path.sep)[0];
  return head.endsWith(".js") ? head.replace(/\.js$/, "") : head;
}

function scanRepo() {
  // addr -> Map(project -> { files: [], context: number })
  const addrMap = new Map();
  // project -> 'true' | 'false' | 'absent'
  const dcState = new Map();

  for (const { project, dir, file } of listProjects()) {
    const files = dir ? listAdapterFiles(dir) : [file];
    let state = "absent";

    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      if (DOUBLECOUNTED_TRUE_RE.test(text)) state = "true";
      else if (DOUBLECOUNTED_FALSE_RE.test(text) && state !== "true") state = "false";

      for (const [addr, context] of findOwnerAddresses(text)) {
        if (IGNORED_ADDRESSES.has(addr)) continue;
        if (!addrMap.has(addr)) addrMap.set(addr, new Map());
        const perProject = addrMap.get(addr);
        if (!perProject.has(project)) perProject.set(project, { files: [], context });
        const entry = perProject.get(project);
        entry.context = Math.min(entry.context, context);
        const rel = path.relative(ROOT, f);
        if (!entry.files.includes(rel)) entry.files.push(rel);
      }
    }
    dcState.set(project, state);
  }

  return { addrMap, dcState };
}

/**
 * How much a collision is worth a human's time.
 *
 * high   both sides track this address on its own or in a very short list, so both are
 *        plainly claiming that specific balance
 * medium one side carries it in a longer list
 * low    both sides carry it inside a large list of addresses, where it is more likely to
 *        be a shared venue than a shared claim, and needs context to judge
 *
 * Sharing several addresses between the same pair of projects raises confidence, since
 * duplicated blocks of owners are a stronger signal than one address in common.
 */
function scoreCollision(contexts, sharedAddressCount) {
  const worst = Math.max(...contexts);
  let level = worst <= 3 ? "high" : worst <= 20 ? "medium" : "low";
  if (sharedAddressCount >= 3 && level === "medium") level = "high";
  if (sharedAddressCount >= 3 && level === "low") level = "medium";
  return level;
}

function loadDecisions() {
  if (!fs.existsSync(DECISIONS_FILE)) return { reviewed: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(DECISIONS_FILE, "utf8"));
    return { reviewed: Array.isArray(parsed.reviewed) ? parsed.reviewed : [] };
  } catch (e) {
    console.warn(`Could not read ${path.relative(ROOT, DECISIONS_FILE)}, treating it as empty: ${e.message}`);
    return { reviewed: [] };
  }
}

function decisionFor(decisions, addr, projects) {
  const key = [...projects].sort().join(",");
  return decisions.reviewed.find(
    (d) => d.address.toLowerCase() === addr && [...(d.projects || [])].sort().join(",") === key
  );
}

function buildFindings() {
  const { addrMap, dcState } = scanRepo();
  const decisions = loadDecisions();

  // how many addresses each unordered project pair shares, for the confidence bump
  const pairCounts = new Map();
  for (const [, perProject] of addrMap) {
    const projects = [...perProject.keys()];
    if (projects.length < 2 || projects.length > MAX_PROJECTS_PER_ADDRESS) continue;
    const key = projects.slice().sort().join("|");
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  }

  const findings = [];
  for (const [addr, perProject] of addrMap) {
    const projects = [...perProject.keys()];
    if (projects.length < 2 || projects.length > MAX_PROJECTS_PER_ADDRESS) continue;

    const states = projects.map((p) => dcState.get(p) || "absent");
    const flagged = states.some((s) => s === "true" || s === "false");
    const contexts = projects.map((p) => perProject.get(p).context);
    const sharedAddressCount = pairCounts.get(projects.slice().sort().join("|")) || 1;

    findings.push({
      address: addr,
      projects,
      states,
      files: projects.map((p) => perProject.get(p).files),
      confidence: scoreCollision(contexts, sharedAddressCount),
      ownerListSizes: contexts,
      sharedAddressesWithSamePair: sharedAddressCount,
      flagged,
      decision: decisionFor(decisions, addr, projects) || null,
    });
  }

  const rank = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => rank[a.confidence] - rank[b.confidence] || a.address.localeCompare(b.address));
  return findings;
}

function describe(f) {
  const sides = f.projects
    .map((p, i) => `${p}${f.states[i] === "absent" ? "" : `(doublecounted:${f.states[i]})`}`)
    .join(", ");
  const extra =
    f.sharedAddressesWithSamePair > 1
      ? `, ${f.sharedAddressesWithSamePair} addresses shared by this same pair`
      : "";
  return `[${f.confidence}] ${f.address}  ->  ${sides}  (owner list sizes ${f.ownerListSizes.join("/")}${extra})`;
}

function reportFull(asJson) {
  const findings = buildFindings();
  const open = findings.filter((f) => !f.flagged && !f.decision);
  const reviewed = findings.filter((f) => f.decision);
  const flagged = findings.filter((f) => f.flagged && !f.decision);

  if (asJson) {
    console.log(JSON.stringify({ open, reviewed, flagged }, null, 2));
    return;
  }

  console.log(
    `Found ${findings.length} owner-address collisions across 2-${MAX_PROJECTS_PER_ADDRESS} projects.\n`
  );

  console.log(`=== Needs a look (${open.length}) ===`);
  for (const f of open) {
    console.log(describe(f));
    f.files.forEach((list, i) => console.log(`    ${f.projects[i]}: ${list.join(", ")}`));
  }

  console.log(`\n=== Already carries a doublecounted flag (${flagged.length}) ===`);
  for (const f of flagged) console.log(describe(f));

  console.log(`\n=== Reviewed and dismissed, see adapterCollisionsReviewed.json (${reviewed.length}) ===`);
  for (const f of reviewed) console.log(`${f.address}  ->  ${f.projects.join(", ")}: ${f.decision.reason}`);
}

/**
 * Check only the files changed in a PR against the rest of the repo. Reports a collision
 * when a changed file introduces an owner address that an unrelated project already claims,
 * unless either side already carries a doublecounted flag (false means someone reviewed this
 * exact case and ruled it out) or the pair is recorded in adapterCollisionsReviewed.json.
 */
function checkChanged(changedFiles) {
  const { addrMap, dcState } = scanRepo();
  const decisions = loadDecisions();
  const changedProjects = new Set(changedFiles.map(projectNameFromFile));
  const reported = [];

  for (const file of changedFiles) {
    const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
    if (!fs.existsSync(abs)) continue;
    const project = projectNameFromFile(abs);
    const ownerAddrs = findOwnerAddresses(fs.readFileSync(abs, "utf8"));

    for (const [addr, context] of ownerAddrs) {
      if (IGNORED_ADDRESSES.has(addr)) continue;
      const perProject = addrMap.get(addr);
      if (!perProject) continue;

      const others = [...perProject.keys()].filter((p) => p !== project && !changedProjects.has(p));
      if (!others.length) continue;

      const allProjects = [project, ...others];
      if (decisionFor(decisions, addr, allProjects)) continue;

      const states = allProjects.map((p) => dcState.get(p) || "absent");
      if (states.some((s) => s === "true" || s === "false")) {
        console.log(
          `INFO: ${addr} is also claimed by ${others.join(", ")}, but a doublecounted flag is already set, not reporting.`
        );
        continue;
      }

      const contexts = [context, ...others.map((p) => perProject.get(p).context)];
      reported.push({
        address: addr,
        projects: allProjects,
        confidence: scoreCollision(contexts, 1),
      });
    }
  }

  if (!reported.length) {
    console.log("No new unreviewed owner-address collisions.");
    return;
  }

  for (const r of reported) {
    console.log(
      `POSSIBLE DOUBLE-COUNT [${r.confidence} confidence]: ${r.address} is claimed as a balance target ` +
        `by ${r.projects[0]} and also by the unrelated project(s) ${r.projects.slice(1).join(", ")}. ` +
        `If that overlap is intended, set "doublecounted: true" on whichever side aggregates the other. ` +
        `If the address means something different here, set "doublecounted: false" so it is not raised again.`
    );
  }
}

// Append a reviewed-and-dismissed entry, so a settled false positive stops coming back.
function ack(address, reason) {
  const addr = String(address || "").toLowerCase();
  if (!EVM_ADDR_RE.test(addr)) {
    console.error("Usage: --ack <0x address> <reason>");
    process.exit(1);
  }
  if (!reason) {
    console.error("A reason is required, so the next person knows why this was dismissed.");
    process.exit(1);
  }

  const { addrMap } = scanRepo();
  const perProject = addrMap.get(addr);
  if (!perProject) {
    console.error(`${addr} is not currently in an owner position in any adapter.`);
    process.exit(1);
  }

  const decisions = loadDecisions();
  const projects = [...perProject.keys()].sort();
  const existing = decisionFor(decisions, addr, projects);
  if (existing) {
    existing.reason = reason;
    existing.reviewedOn = new Date().toISOString().slice(0, 10);
  } else {
    decisions.reviewed.push({
      address: addr,
      projects,
      reason,
      reviewedOn: new Date().toISOString().slice(0, 10),
    });
  }
  decisions.reviewed.sort((a, b) => a.address.localeCompare(b.address));
  fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2) + "\n");
  console.log(`Recorded ${addr} (${projects.join(", ")}).`);
}

const args = process.argv.slice(2);
if (args[0] === "--changed") checkChanged(args.slice(1));
else if (args[0] === "--ack") ack(args[1], args.slice(2).join(" "));
else reportFull(args.includes("--json"));
