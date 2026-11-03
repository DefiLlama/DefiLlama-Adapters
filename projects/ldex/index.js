const axios = require('axios');

/* ============================================================
   LDEX AMM DEX Adapter for DefiLlama
   Chain: LUXA Sovereign Layer-1 (luxa-1)
   Protocol: LDEX (CosmWasm AMM Pairs)
   ============================================================ */

const REST_ENDPOINTS = [
  'https://api.luxaecosystem.xyz',
  'https://luxaecosystem.alwaysdata.net',
];

// Fallback Genesis AMM contract address
const GENESIS_POOL = 'luxa14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9smu4c28';

// CosmWasm Pair Contract Code IDs on luxa-1
const PAIR_CODE_IDS = [1, 4];

const DEFAULT_TIMEOUT = 15000;

/**
 * Return the first non-empty string among the given values, or ''.
 * Ignores objects/arrays/other shapes so they can never reach string methods.
 */
function firstString(...values) {
  return values.find((v) => typeof v === 'string' && v.length > 0) || '';
}

/**
 * Identify if an error is a CosmWasm contract error indicating that
 * the contract does not implement / support the requested query variant.
 * Non-string error details are treated as unclassified (retryable).
 */
function isUnsupportedQuery(err) {
  const data = err?.response?.data;
  const errMsg = firstString(data?.message, data?.error, data, err?.message).toLowerCase();

  return (
    errMsg.includes('unknown variant') ||
    errMsg.includes('error parsing into type') ||
    errMsg.includes('cannot deserialize') ||
    errMsg.includes('unsupported query')
  );
}

/**
 * Resilient GET helper with automatic multi-endpoint fallback.
 * Preserves HTTP status and response data on errors.
 */
async function queryRest(path) {
  let lastError = null;

  for (const base of REST_ENDPOINTS) {
    try {
      const res = await axios.get(`${base}${path}`, { timeout: DEFAULT_TIMEOUT });
      if (res && res.data) return res.data;
    } catch (err) {
      lastError = err;
      // The node answered and the contract itself rejected the query message:
      // the node is healthy, so do not retry on another endpoint.
      if (isUnsupportedQuery(err)) throw err;
    }
  }

  const status = lastError?.response?.status;
  const msg = firstString(lastError?.response?.data?.message, lastError?.message) || 'Unknown error';
  const err = new Error(`All REST endpoints failed for ${path} (status ${status}): ${msg}`);
  err.response = lastError?.response;
  err.status = status;
  err.code = lastError?.code;
  throw err;
}

/**
 * Fetch every page of a paginated Cosmos REST list endpoint.
 * `field` is the array property holding the items (e.g. 'contracts', 'balances').
 * Throws if the node repeats a pagination key, to avoid infinite loops and
 * to never return duplicated or incomplete data.
 */
async function fetchAllPages(basePath, field) {
  const items = [];
  const seenKeys = new Set();
  let nextKey = null;

  do {
    const path = nextKey ? `${basePath}?pagination.key=${encodeURIComponent(nextKey)}` : basePath;
    const res = await queryRest(path);

    if (Array.isArray(res?.[field])) items.push(...res[field]);

    nextKey = res?.pagination?.next_key || null;
    if (nextKey) {
      if (seenKeys.has(nextKey)) {
        // A repeated cursor means the node is misbehaving: results may be
        // duplicated or incomplete, so fail the run instead of reporting wrong TVL.
        throw new Error(`Repeated pagination key for ${basePath}: ${nextKey}`);
      }
      seenKeys.add(nextKey);
    }
  } while (nextKey);

  return items;
}

/**
 * Fetch all contracts deployed under a code ID.
 */
function getContractsByCodeId(codeId) {
  return fetchAllPages(`/cosmwasm/wasm/v1/code/${codeId}/contracts`, 'contracts');
}

/**
 * Fetch all bank balances for an address.
 */
function getBankBalances(address) {
  return fetchAllPages(`/cosmos/bank/v1beta1/balances/${address}`, 'balances');
}

/**
 * Fetch all deployed pool contract addresses on luxa-1.
 */
async function getPoolAddresses() {
  const pools = new Set([GENESIS_POOL]);

  for (const codeId of PAIR_CODE_IDS) {
    const contracts = await getContractsByCodeId(codeId);
    for (const addr of contracts) {
      if (typeof addr === 'string' && addr.startsWith('luxa1')) {
        pools.add(addr);
      }
    }
  }

  return Array.from(pools);
}

/**
 * Add CW20 reserves from the pool's pair_info query.
 * Contracts that do not implement pair_info are skipped; any other failure
 * is rethrown so TVL is never silently under-reported.
 */
async function addCw20Reserves(api, pool) {
  try {
    const query = Buffer.from(JSON.stringify({ pair_info: {} })).toString('base64');
    const res = await queryRest(`/cosmwasm/wasm/v1/contract/${pool}/smart/${query}`);
    const info = res?.data;
    if (!info) return;

    const sides = [
      [info.token_a, info.reserve_a],
      [info.token_b, info.reserve_b],
    ];
    for (const [token, reserve] of sides) {
      if (typeof token === 'string' && token.startsWith('luxa1') && reserve && reserve !== '0') {
        api.add(token, reserve);
      }
    }
  } catch (err) {
    // Contract does not support pair_info (e.g. Genesis Code 1 pool): skip safely.
    if (!isUnsupportedQuery(err)) throw err;
  }
}

/**
 * Main TVL calculation function for DefiLlama SDK v2.
 */
async function tvl(api) {
  const pools = await getPoolAddresses();

  for (const pool of pools) {
    // 1. Cosmos SDK bank reserves (exhausted retries throw to prevent partial/zero TVL)
    const balances = await getBankBalances(pool);
    for (const coin of balances) {
      if (coin.denom && coin.amount && coin.amount !== '0') {
        api.add(coin.denom, coin.amount);
      }
    }

    // 2. CW20 reserves
    await addCw20Reserves(api, pool);
  }

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    'TVL counts all liquidity reserves (Cosmos native bank assets such as uluxa/ushard and CW20 smart contract tokens) locked inside LDEX CosmWasm AMM pair contracts on the LUXA blockchain.',
  luxa: {
    tvl,
  },
};
