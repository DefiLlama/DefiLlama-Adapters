const SUFFIX_MULTIPLIER = { T: 1e12, B: 1e9, M: 1e6, k: 1e3 };
const TVL_MARKER = '------ TVL ------';
const ERROR_MARKER = '------ ERROR ------';
const HUMANIZED_RE = /^(-?)(\d+(?:\.\d+)?)(?:\s+([TBMk]))?$/;

function parseHumanizedNumber(raw) {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'nan') return null;
  const m = trimmed.match(HUMANIZED_RE);
  if (!m) return null;
  const [, sign, digits, suffix] = m;
  const base = Number(digits);
  if (!Number.isFinite(base)) return null;
  const multiplier = suffix ? SUFFIX_MULTIPLIER[suffix] : 1;
  return (sign === '-' ? -1 : 1) * base * multiplier;
}

function parseTvl(stdout) {
  if (typeof stdout !== 'string') {
    throw new TypeError('parseTvl: stdout must be a string');
  }

  const errorIdx = stdout.indexOf(ERROR_MARKER);
  const tvlIdx = stdout.indexOf(TVL_MARKER);

  if (tvlIdx === -1) {
    return {
      schema: 'tvl-baseline-v1',
      errored: true,
      errorTail: errorIdx !== -1 ? stdout.slice(errorIdx).slice(0, 4000) : null,
      totals: {},
    };
  }

  return {
    schema: 'tvl-baseline-v1',
    errored: false,
    totals: parseTotalsBlock(stdout.slice(tvlIdx + TVL_MARKER.length)),
  };
}

function parseTotalsBlock(text) {
  const totals = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('---')) break;
    const match = line.match(/^(\S+)\s+(.+)$/);
    if (!match) continue;
    const value = parseHumanizedNumber(match[2].trim());
    if (value === null) continue;
    const key = match[1] === 'total' ? 'tvl' : match[1];
    totals[key] = value;
  }
  return totals;
}

if (require.main === module) {
  const fs = require('fs');
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath) {
    console.error('usage: parseTvl.js <input.txt> [output.json]');
    process.exit(1);
  }
  const parsed = parseTvl(fs.readFileSync(inputPath, 'utf-8'));
  if (process.env.ADAPTER_PATH) parsed.adapter = process.env.ADAPTER_PATH;
  if (process.env.FILE_SHA) parsed.fileSha = process.env.FILE_SHA;
  if (process.env.CAPTURED_AT) parsed.capturedAt = process.env.CAPTURED_AT;
  const json = JSON.stringify(parsed);
  if (outputPath) fs.writeFileSync(outputPath, json);
  else process.stdout.write(json + '\n');
}

module.exports = { parseTvl, parseHumanizedNumber };
