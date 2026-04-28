// Adds sanity warnings to a PR alongside the existing TVL output produced by
// test.js / commentResult.js. Catches the common shipping-failure modes that
// the existing pipeline does not flag, e.g. an adapter that runs cleanly but
// computes $0 (unpriced tokens — almost always the cause when a new chain is
// involved) or $50B+ (likely double-counting / wrong decimals).
//
// Usage:
//   node .github/workflows/sanityCheck.js <output.txt> <pr-comments-dir> <adapter-path>
//
// Designed to be invoked from test.yml right after commentResult.js. Writes its
// own markdown file into the pr-comments dir; comment.yml will pick it up and
// post it. Never throws — on any error it just exits 0 silently so the rest of
// the CI pipeline is unaffected.

const path = require('path');
const fs = require('fs');

// $50B is well above the largest single-protocol TVL on DefiLlama at the time of
// writing. Anything above that on a fresh adapter is almost always a bug
// (decimals, double-counting, wrong owner).
const HIGH_TVL_USD = 50_000_000_000;

function parseTotalTvl(testOutput) {
  // commentResult.js parses the same "------ TVL ------" section. We look for
  // the "total" line: e.g. "total                    659.34 k"
  const tvlSection = testOutput.split('------ TVL ------')[1];
  if (!tvlSection) return null;

  const totalMatch = tvlSection.match(/^\s*total\s+([\d.,]+)\s*([kKmMbB])?\s*$/m);
  if (!totalMatch) return null;

  let value = Number(totalMatch[1].replace(/,/g, ''));
  if (Number.isNaN(value)) return null;
  const suffix = (totalMatch[2] || '').toLowerCase();
  if (suffix === 'k') value *= 1e3;
  else if (suffix === 'm') value *= 1e6;
  else if (suffix === 'b') value *= 1e9;
  return value;
}

function readAdapterSource(adapterPath) {
  // adapterPath comes in as "projects/risex" (a directory) or
  // "projects/helper/foo.js". Resolve to a readable .js file when it's a dir.
  if (!adapterPath) return null;
  let abs = path.resolve(process.cwd(), adapterPath);
  try {
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      abs = path.join(abs, 'index.js');
      if (!fs.existsSync(abs)) return null;
    }
    return fs.readFileSync(abs, 'utf-8');
  } catch {
    return null;
  }
}

function detectMethodology(source) {
  if (!source) return { found: false, unknown: true };
  // Looks for `methodology:` followed by a string literal anywhere in the file.
  return { found: /\bmethodology\s*:\s*['"`]/.test(source), unknown: false };
}

function detectFetchAdapter(source) {
  if (!source) return false;
  // Heuristic: a non-helper adapter that imports node-fetch / axios and reads
  // an HTTP URL is likely a "fetch adapter" — banned for new projects per
  // pull_request_template.md.
  const httpUseRegex = /https?:\/\/(?!.*\b(rpc|node|infura|alchemy|public|llama|ankr|drpc|blockpi)\b)/i;
  const httpUsed = httpUseRegex.test(source);
  const importsHttpClient = /\brequire\s*\(\s*['"`](node-fetch|axios)['"`]\s*\)/.test(source);
  return importsHttpClient && httpUsed;
}

function buildWarnings({ totalTvl, methodology, fetchAdapter, adapterPath }) {
  const warnings = [];

  if (totalTvl === 0) {
    warnings.push(
      `**TVL evaluates to \`$0\`.** This usually means the supported tokens have no price feed on \`coins.llama.fi\`. ` +
        `If the chain is new to DefiLlama, register a price remap in \`projects/helper/tokenMapping.js\` ` +
        `(e.g. map a bridged stablecoin to its canonical mainnet address) and add the canonical token to ` +
        `\`projects/helper/coreAssets.json\`. If the protocol genuinely holds no value yet, leave a comment ` +
        `explaining that so the maintainer can decide whether to merge.`,
    );
  } else if (totalTvl !== null && totalTvl > HIGH_TVL_USD) {
    warnings.push(
      `**TVL exceeds the \`$${(HIGH_TVL_USD / 1e9).toFixed(0)}B\` sanity bound** (computed: ` +
        `\`$${totalTvl.toLocaleString()}\`). This is almost always a bug — common causes: token decimals ` +
        `wrong, the same balance counted at multiple owners (e.g. vault + LP), reading totalSupply where ` +
        `you meant balanceOf, or pricing a non-stable as USDC. Please double-check the methodology before merging.`,
    );
  }

  if (!methodology.unknown && !methodology.found) {
    warnings.push(
      `**Adapter does not export a \`methodology\` string.** Add one to ` +
        `\`module.exports\` (sibling to the chain blocks) so the methodology shows on the DefiLlama UI ` +
        `and in the protocols API. Example: \`methodology: 'Sum of token balances at the X contract.'\``,
    );
  }

  if (fetchAdapter) {
    warnings.push(
      `**This looks like a fetch adapter** (imports \`axios\`/\`node-fetch\` and reads a non-RPC HTTP URL). ` +
        `Per the PR template, fetch adapters are not accepted for new projects — TVL must be computed from ` +
        `on-chain data. If the URL is actually an RPC endpoint, ignore this warning.`,
    );
  }

  if (!warnings.length) return null;

  return [
    `### Sanity check — ${adapterPath}`,
    '',
    ...warnings.map((w) => `- ${w}`),
    '',
    `<sub>Posted by \`.github/workflows/sanityCheck.js\`. These are warnings, not blockers — ` +
      `the maintainer will weigh in.</sub>`,
  ].join('\n');
}

function main() {
  const [, , logPath, outDir, adapterPath] = process.argv;
  if (!logPath || !outDir) return;

  let testOutput = '';
  try {
    testOutput = fs.readFileSync(logPath, 'utf-8');
  } catch {
    return;
  }

  // Skip if the run errored out — the existing commentResult.js already posts
  // the error and there's no point piling on.
  if (testOutput.includes('------ ERROR ------')) return;

  const totalTvl = parseTotalTvl(testOutput);
  const source = readAdapterSource(adapterPath);
  const methodology = detectMethodology(source);
  const fetchAdapter = detectFetchAdapter(source);

  const body = buildWarnings({ totalTvl, methodology, fetchAdapter, adapterPath });
  if (!body) return;

  fs.mkdirSync(outDir, { recursive: true });
  const safeName = (adapterPath || 'general').replace(/[^a-zA-Z0-9._-]/g, '_');
  // Prefix with "z-" so the filename sorts after the TVL output from
  // commentResult.js (which uses a numeric Date.now() prefix). Keeps the
  // sanity warnings as a follow-on comment under the TVL summary.
  const fileName = `z-sanity-${Date.now()}-${process.pid}-${safeName}.md`;
  fs.writeFileSync(path.join(outDir, fileName), body);
}

try {
  main();
} catch (e) {
  // Never break the CI pipeline because of a sanity-check bug.
  console.error('sanityCheck failed:', e && e.message);
}
