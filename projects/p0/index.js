const axios = require('axios');

// P0 public API (p0-monitor). Override the host via P0_PUBLIC_API_BASE if needed.
const BASE_URL = process.env.P0_PUBLIC_API_BASE || 'https://api.0.xyz';
const METRICS_ENDPOINT = `${BASE_URL}/v0/bankMetrics`;

async function fetchMetrics() {
  const { data } = await axios.get(METRICS_ENDPOINT, { timeout: 30000 });
  if (!data || !Array.isArray(data.banks)) {
    throw new Error('p0 adapter: unexpected /v0/bankMetrics response shape');
  }
  return data;
}

function addSide(api, banks, nativeField) {
  for (const b of banks) {
    if (!b.priced || !b.mint) continue;
    // Whole base units only; skip anything that isn't a clean integer string.
    const baseUnits = String(b[nativeField] ?? '').split('.')[0];
    if (/^\d+$/.test(baseUnits) && baseUnits !== '0') api.add(b.mint, baseUnits);
  }
}

async function tvl(api) {
  const { banks } = await fetchMetrics();
  addSide(api, banks, 'totalDepositsNative');
}

async function borrowed(api) {
  const { banks } = await fetchMetrics();
  addSide(api, banks, 'totalBorrowsNative');
}

module.exports = {
  doublecounted: true,
  // /v0/bankMetrics returns current state only (no historical param), so opt out
  // of DefiLlama's historical backfill instead of stamping today's TVL onto the past.
  timetravel: false,
  methodology:
    'TVL is the sum of all deposited funds across every P0 bank. Active Loans is the sum of all outstanding borrows. All banks are reported per underlying mint; data comes from the P0 public API (/v0/bankMetrics).',
  solana: {
    tvl,
    borrowed,
  },
};
