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
 * Identify if an error is a CosmWasm contract error indicating that
 * the contract does not implement / support the requested query variant.
 */
function isUnsupportedQuery(err) {
  const errMsg = (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err?.response?.data : '') ||
    err?.message ||
    ''
  ).toLowerCase();

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
      const url = `${base}${path}`;
      const res = await axios.get(url, { timeout: DEFAULT_TIMEOUT });
      if (res && res.data) return res.data;
    } catch (err) {
      lastError = err;
      // If the node responded with an unsupported CosmWasm query error,
      // the node is healthy and the contract itself rejected the query message.
      if (isUnsupportedQuery(err)) {
        throw err;
      }
    }
  }

  const status = lastError?.response?.status;
  const msg = lastError?.response?.data?.message || lastError?.message || 'Unknown error';
  const err = new Error(`All REST endpoints failed for ${path} (status ${status}): ${msg}`);
  err.response = lastError?.response;
  err.status = status;
  err.code = lastError?.code;
  throw err;
}

/**
 * Fetch all contracts deployed under a code ID, following pagination until exhausted.
 */
async function getContractsByCodeId(codeId) {
  const contracts = [];
  let nextKey = null;

  do {
    const basePath = `/cosmwasm/wasm/v1/code/${codeId}/contracts`;
    const queryPath = nextKey ? `${basePath}?pagination.key=${encodeURIComponent(nextKey)}` : basePath;
    const res = await queryRest(queryPath);
    if (res && Array.isArray(res.contracts)) {
      contracts.push(...res.contracts);
    }
    nextKey = res?.pagination?.next_key || null;
  } while (nextKey);

  return contracts;
}

/**
 * Fetch all deployed pool contract addresses on luxa-1
 */
async function getPoolAddresses() {
  const pools = new Set([GENESIS_POOL]);

  for (const codeId of PAIR_CODE_IDS) {
    const contracts = await getContractsByCodeId(codeId);
    for (const addr of contracts) {
      if (addr && addr.startsWith('luxa1')) {
        pools.add(addr);
      }
    }
  }

  return Array.from(pools);
}

/**
 * Fetch all bank balances for an address, following pagination until exhausted.
 */
async function getBankBalances(address) {
  const balances = [];
  let nextKey = null;

  do {
    const basePath = `/cosmos/bank/v1beta1/balances/${address}`;
    const queryPath = nextKey ? `${basePath}?pagination.key=${encodeURIComponent(nextKey)}` : basePath;
    const res = await queryRest(queryPath);
    if (res && Array.isArray(res.balances)) {
      balances.push(...res.balances);
    }
    nextKey = res?.pagination?.next_key || null;
  } while (nextKey);

  return balances;
}

/**
 * Main TVL calculation function for DefiLlama SDK v2
 */
async function tvl(api) {
  const pools = await getPoolAddresses();

  for (const pool of pools) {
    // 1. Cosmos SDK Bank reserves (required; exhausted retries throw to prevent partial/zero TVL)
    const balances = await getBankBalances(pool);
    for (const coin of balances) {
      if (coin.denom && coin.amount && coin.amount !== '0') {
        api.add(coin.denom, coin.amount);
      }
    }

    // 2. CW20 Pair Info query
    // If the contract does not implement pair_info, safely ignore.
    // If transient failures occur on all endpoints (timeouts/server errors), rethrow to prevent underreporting TVL.
    try {
      const queryBase64 = Buffer.from(JSON.stringify({ pair_info: {} })).toString('base64');
      const pairRes = await queryRest(`/cosmwasm/wasm/v1/contract/${pool}/smart/${queryBase64}`);
      const pData = pairRes?.data;

      if (pData) {
        if (pData.token_b && pData.token_b.startsWith('luxa1') && pData.reserve_b && pData.reserve_b !== '0') {
          api.add(pData.token_b, pData.reserve_b);
        }
        if (pData.token_a && pData.token_a.startsWith('luxa1') && pData.reserve_a && pData.reserve_a !== '0') {
          api.add(pData.token_a, pData.reserve_a);
        }
      }
    } catch (err) {
      if (isUnsupportedQuery(err)) {
        // Contract does not support pair_info (e.g. Genesis Code 1 pool); skip safely
      } else {
        // Transient network or server failure: propagate to fail TVL run rather than omitting reserves
        throw err;
      }
    }
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
