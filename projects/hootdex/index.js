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

  // Don't silently treat "no array back" as "zero treasuries" - fail loudly
  // instead, the same discipline that caught the earlier wrong-host bug.
  if (!Array.isArray(result)) {
    throw new Error(
      `eth_getTreasuryAddresses didn't return an array - got: ${JSON.stringify(
        result
      ).slice(0, 300)}`
    );
  }

  const addresses = new Set();
  for (const entry of result) {
    if (entry?.real_treasury_address)
      addresses.add(entry.real_treasury_address);
  }

  return Array.from(addresses);
}

// Real chain-RPC read: one pecu_getEscrowBalance call per real escrow
// address, straight to mainnet.pecunovus.net - not to any pre-computed
// Hootdex-operated report.
async function getEscrowBalance(address) {
  try {
    const result = await rpcCall('pecu_getEscrowBalance', [address, 'PECU']);
    const amount = Number(result);
    return Number.isFinite(amount) ? amount : 0;
  } catch (e) {
    console.error(
      `[hootdex adapter] pecu_getEscrowBalance failed for ${address}:`,
      e.message
    );
    throw e;
  }
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
  const addresses = await getTreasuryAddresses();
  const amounts = await mapWithConcurrency(addresses, 10, getEscrowBalance);
  const totalPecu = amounts.reduce((sum, a) => sum + a, 0);

  const balances = {};
  // Chain tag "pecu" matches the prior PR (#19726), reused rather than
  // invented fresh. Pricing this raw balance still needs an answer from
  // DefiLlama on how to handle a native asset with no CoinGecko listing -
  // see NOTES.md.
  balances['pecu:native'] = totalPecu;

  return balances;
}

module.exports = {
  methodology:
    "TVL is the sum of real PECU balances held in Hootdex's Digital Asset " +
    'Treasury escrow accounts on the Pecu Novus L1 (chainId 27272727). ' +
    'Both the list of treasury addresses (via eth_getTreasuryAddresses) and ' +
    "each one's real balance (via pecu_getEscrowBalance) are read via JSON-RPC " +
    "directly against Pecu Novus's own node (mainnet.pecunovus.net) - a single " +
    'host for the whole adapter, no separate API call anywhere else. Only the ' +
    'native PECU settlement ' +
    "asset is counted. Hootdex's tokenized catalog (SynthCryptos such as " +
    'hETH/hBNB/hBTC, DBTs, Hybrid/Venture/Wrap/XMG tokens) is deliberately ' +
    'excluded: those are priced/collateralized in PECU or USXM inside a ' +
    'Pecu-native DBT, not backed by any real asset locked in a bridge or ' +
    'contract on their respective source chains, so their backing cannot be ' +
    'independently verified the way a prior review of this project asked ' +
    '(see github.com/DefiLlama/DefiLlama-Adapters/pull/19726). This adapter ' +
    'only claims the portion of TVL that is genuinely chain-verifiable today.',
  timetravel: false,
  pecu: {
    tvl
  }
};
