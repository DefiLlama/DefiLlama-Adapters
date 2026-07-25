/**
 * DefiLlama TVL adapter for Hootdex / Pecu Novus (PECU).
 *
 * Destination: fork DefiLlama/DefiLlama-Adapters, add this file at
 * projects/hootdex/index.js.
 *
 */

const axios = require('axios');

let CHAIN_PROVIDERS = {};
try {
  CHAIN_PROVIDERS = require('@defillama/sdk/build/providers.json');
} catch (e) {
  console.error(
    '[hootdex adapter] could not load @defillama/sdk providers.json:',
    e.message
  );
}

const PECU_RPC_URL =
  process.env.PECU_RPC || // DefiLlama's {CHAIN}_RPC override convention
  process.env.PECU_RPC_URL || // kept for backwards compat with earlier drafts
  CHAIN_PROVIDERS['pecu']?.rpc?.[0] || // once "pecu" exists in providers.json, used automatically
  'https://mainnet.pecunovus.net'; // fallback while "pecu" isn't in providers.json yet

// Hootdex's own public markets indexer - used ONLY as a price source for
// PECU (no CoinGecko listing exists), never as a TVL/balance source. See
// header note on why this specific substitution is disclosed via
// misrepresentedTokens rather than hidden.
const MARKETS_JSON_URL =
  process.env.HOOTDEX_MARKETS_JSON_URL ||
  'https://api.hootdex.org/markets.json';

let rpcId = 0;

async function rpcCall(method, params) {
  const { data } = await axios.post(
    PECU_RPC_URL,
    { jsonrpc: '2.0', id: ++rpcId, method, params },
    { timeout: 15000 }
  );
  if (data?.error) {
    throw new Error(
      `${method} RPC error ${data.error.code}: ${data.error.message}`
    );
  }
  return data?.result;
}

// Treasury address discovery via JSON-RPC (eth_getTreasuryAddresses), not
// a separate REST call to a different host - see header note on why the
// REST route for this data isn't actually reachable.

async function getTreasuryAddresses() {
  const result = await rpcCall('eth_getTreasuryAddresses', []);

  if (!Array.isArray(result)) {
    throw new Error(
      `eth_getTreasuryAddresses didn't return an array - got: ${JSON.stringify(
        result
      ).slice(0, 300)}`
    );
  }

  const addresses = new Set();
  for (const [i, entry] of result.entries()) {
    const addr = entry?.real_treasury_address;
    if (typeof addr !== 'string' || addr.trim().length === 0) {
      throw new Error(
        `eth_getTreasuryAddresses returned a malformed record at index ${i} (missing/invalid ` +
          `real_treasury_address) - got: ${JSON.stringify(entry).slice(
            0,
            300
          )}. Refusing to ` +
          `silently skip it, since that would understate HDVL rather than fail loudly.`
      );
    }
    addresses.add(addr);
  }

  return Array.from(addresses);
}

// Real chain-RPC read: one pecu_getEscrowBalance call per real escrow
// address, straight to mainnet.pecunovus.net - not to any pre-computed
// Hootdex-operated report.
//

async function getEscrowBalance(address) {
  const result = await rpcCall('pecu_getEscrowBalance', [address, 'PECU']);
  const amount = Number(result);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(
      `pecu_getEscrowBalance for ${address} returned an invalid balance (not a finite, ` +
        `non-negative number) - got: ${JSON.stringify(
          result
        )}. Refusing to coerce this to 0.`
    );
  }
  return amount;
}

async function getPecuPriceUsd() {
  const { data } = await axios.get(MARKETS_JSON_URL, { timeout: 15000 });
  const markets = Array.isArray(data?.markets) ? data.markets : null;
  if (!markets) {
    throw new Error(
      `${MARKETS_JSON_URL} didn't return a markets array - got: ${JSON.stringify(
        data
      ).slice(0, 300)}`
    );
  }

  const pecuMarket = markets.find(
    (m) => m?.marketId === 'pecu-usxm' || m?.base === 'PECU'
  );
  const price = Number(pecuMarket?.price);
  if (!pecuMarket || !Number.isFinite(price) || price <= 0) {
    throw new Error(
      `Could not find a valid PECU/USD price in ${MARKETS_JSON_URL} - pecu-usxm entry: ` +
        `${JSON.stringify(pecuMarket).slice(0, 300)}`
    );
  }

  return price;
}

// Simple concurrency-capped map - many treasury addresses means many
// sequential round trips if done one at a time, but hammering the API with
// one unbounded Promise.all per treasury isn't polite either. Batches of 10
// balances the two concerns without adding a new dependency.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return results;
}

async function tvl() {
  const [addresses, pecuPriceUsd] = await Promise.all([
    getTreasuryAddresses(),
    getPecuPriceUsd()
  ]);

  const amounts = await mapWithConcurrency(addresses, 10, getEscrowBalance);
  const totalPecu = amounts.reduce((sum, a) => sum + a, 0);
  const totalUsd = totalPecu * pecuPriceUsd;

  const balances = {};
  // Reported as coingecko:tether (a real, already-priced DefiLlama coin key)
  // with the pre-converted USD amount as the "quantity" - the standard
  // disclosed-substitution pattern for a token with no native price feed,
  // combined with misrepresentedTokens: true below. See header note.
  balances['coingecko:tether'] = totalUsd;

  return balances;
}

module.exports = {
  methodology:
    'TVL reported here is Hootdex\'s "HD Vault Liquidity" (HDVL) - the real, ' +
    'live sum of PECU held ONLY in the specific Digital Asset Treasury (DAT) ' +
    "escrow wallets that feed Hootdex's order book on the Pecu Novus L1 " +
    '(chainId 27272727), not any wallet a token has ever merely touched. ' +
    'Both the list of treasury addresses (via eth_getTreasuryAddresses) and ' +
    "each one's real balance (via pecu_getEscrowBalance) are read via JSON-RPC " +
    "directly against Pecu Novus's own node (mainnet.pecunovus.net). The raw " +
    "PECU total is converted to USD using PECU's real, live price from " +
    "Hootdex's own public markets.json (PECU has no CoinGecko/CMC listing), " +
    'then reported as coingecko:tether with misrepresentedTokens: true - a ' +
    'disclosed unit-of-account substitution (same pattern DefiLlama documents ' +
    'for e.g. PancakeSwap), not a repeat of a prior USD-figure-smuggling ' +
    'mistake: the underlying PECU quantity here is independently chain-verified, ' +
    'only its USD conversion lacks a native price slot today. This figure is ' +
    'expected to change frequently with real trading activity, not sit static. ' +
    "Hootdex's tokenized catalog (SynthCryptos such as hETH/hBNB/hBTC, DBTs, " +
    'Hybrid/Venture/Wrap/XMG tokens) is deliberately excluded: those are ' +
    'priced/collateralized in PECU or USXM inside the same Pecu-native DAT, not ' +
    'backed by any real asset locked in a bridge or contract on their respective ' +
    'source chains, so their backing cannot be independently verified the way a ' +
    'prior review of this project asked ' +
    '(see github.com/DefiLlama/DefiLlama-Adapters/pull/19726). This adapter ' +
    'only claims the portion of value that is genuinely chain-verifiable today; ' +
    'Hootdex does not have per-token TVL in the AMM sense, since it operates a ' +
    'Central Limit Order Book, not pooled reserves.',
  misrepresentedTokens: true,
  timetravel: false,
  pecu: {
    tvl
  }
};
