/**
 * Europa Tech — DeFi Llama TVL Adapter
 *
 * EU-regulated, CONSOB-registered (REA: PR-357580) fractional real estate platform.
 * Hotel shares tokenized as ERC-1155 on Base.
 *
 * Website:  https://europa-tech.org
 * Twitter:  @europa_tech
 * Contract: 0x0f3cEe146B7D2F6795E60B33AE6e339A64d77Fc6 (EuropaShareToken, Base)
 */

const ADDRESSES = require('../helper/coreAssets.json');

const EUROPA_SHARE_TOKEN = '0x0f3cEe146B7D2F6795E60B33AE6e339A64d77Fc6';
const API_BASE = 'https://api.europa-tech.org';
const FETCH_TIMEOUT_MS = 10_000; // 10 s abort timeout

// Properties with tokenId offset (tokenIds start at 1, increment per room)
const PROPERTIES = [
  { id: 'obj-001', tokenIdOffset: 1 },   // Hotel Baistrocchi — tokenIds 1-12
  { id: 'obj-002', tokenIdOffset: 13 },  // Albergo Europa    — tokenIds 13-72
];

// USDC on Base — EUR proxy (1 EUR ≈ 1.0 USD, conservative; misrepresentedTokens: true)
const USDC_BASE = ADDRESSES.base.USDC;
const USDC_DECIMALS = 1e6;

const TOTAL_SUPPLY_ABI = 'function totalSupplyPerToken(uint256 tokenId) external view returns (uint256)';

/** Fetch with a hard timeout; throws on non-OK status or network error. */
async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function tvl(api) {
  // Build tokenId → sharePrice map from API
  const tokenPrices = {};
  const failures = [];

  for (const { id, tokenIdOffset } of PROPERTIES) {
    try {
      const json = await fetchWithTimeout(`${API_BASE}/api/objects/${id}/rooms`);
      const rooms = Array.isArray(json) ? json : (json.data || []);

      rooms.forEach((room, idx) => {
        const tokenId = tokenIdOffset + idx;
        if (room.sharePrice > 0 && room.status !== 'UPCOMING') {
          tokenPrices[tokenId] = Number(room.sharePrice);
        }
      });
    } catch (err) {
      console.error(`[europa-tech] Failed to fetch rooms for property ${id} (tokenIdOffset=${tokenIdOffset}):`, err.message);
      failures.push(id);
    }
  }

  if (failures.length > 0) {
    throw new Error(`[europa-tech] Incomplete TVL — failed to load prices for: ${failures.join(', ')}`);
  }

  const tokenIds = Object.keys(tokenPrices).map(Number);
  if (tokenIds.length === 0) return;

  // Read on-chain total supply per tokenId
  const supplies = await api.multiCall({
    abi: TOTAL_SUPPLY_ABI,
    calls: tokenIds.map((id) => ({ target: EUROPA_SHARE_TOKEN, params: [id] })),
    chain: 'base',
  });

  // TVL = Σ (supply × sharePrice_EUR)
  let totalEUR = 0;
  tokenIds.forEach((tokenId, i) => {
    const supply = Number(supplies[i] || 0);
    totalEUR += supply * tokenPrices[tokenId];
  });

  api.add(USDC_BASE, Math.round(totalEUR * USDC_DECIMALS));
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology:
    'TVL = Σ(on-chain totalSupplyPerToken × EUR sharePrice) per tokenId. ' +
    'On-chain supply via EuropaShareToken.totalSupplyPerToken(). ' +
    'EUR prices set by CONSOB-regulated operators, queried from the Europa Tech API. ' +
    'Represented as USDC (1 EUR ≈ 1 USD conservative estimate).',
  base: {
    tvl,
  },
};
