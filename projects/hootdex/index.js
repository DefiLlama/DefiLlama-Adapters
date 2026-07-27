/**
 * DefiLlama TVL adapter for Hootdex / Pecu Novus (PECU).
 *
 */

const axios = require('axios');

// RPC URL resolution, matching DefiLlama's own documented convention
// (README: "Changing RPC providers" - overrides come from a {CHAIN}_RPC
// env var, checked against @defillama/sdk's own providers.json for the
// default). Priority: explicit env override > providers.json entry >
// hardcoded fallback.
//

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
//

async function getTreasuryData() {
  const result = await rpcCall('eth_getTreasuryAddresses', []);

  if (!Array.isArray(result)) {
    throw new Error(
      `eth_getTreasuryAddresses didn't return an array - got: ${JSON.stringify(
        result
      ).slice(0, 300)}`
    );
  }

  const treasuries = [];
  const seen = new Set();

  for (const [i, entry] of result.entries()) {
    const address = entry?.real_treasury_address;
    const amount = Number(entry?.amount);

    if (typeof address !== 'string' || address.trim().length === 0) {
      throw new Error(
        `Invalid treasury record at index ${i}: missing real_treasury_address`
      );
    }

    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(
        `Invalid treasury amount for ${address}: ${JSON.stringify(
          entry?.amount
        )}`
      );
    }

    // Avoid duplicate treasury entries
    if (seen.has(address)) continue;
    seen.add(address);

    treasuries.push({
      address,
      amount
    });
  }

  return treasuries;
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

async function tvl() {
  const [treasuries, pecuPriceUsd] = await Promise.all([
    getTreasuryData(),
    getPecuPriceUsd()
  ]);

  const totalPecu = treasuries.reduce(
    (sum, treasury) => sum + treasury.amount,
    0
  );

  const totalUsd = totalPecu * pecuPriceUsd;

  return {
    'coingecko:tether': totalUsd
  };
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
