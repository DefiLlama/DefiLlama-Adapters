const { get } = require('../helper/http');

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

/**
 * Resilient GET helper with automatic multi-endpoint fallback.
 * Throws an error when all endpoints fail unless throwOnError is false.
 */
async function queryRest(path, { throwOnError = true } = {}) {
  let lastError = null;
  for (const base of REST_ENDPOINTS) {
    try {
      const url = `${base}${path}`;
      const res = await get(url);
      if (res) return res;
    } catch (err) {
      lastError = err;
    }
  }
  if (throwOnError) {
    throw new Error(`All REST endpoints failed for ${path}. Last error: ${lastError?.message || lastError}`);
  }
  return null;
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
    const res = await queryRest(queryPath, { throwOnError: true });
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
    const res = await queryRest(queryPath, { throwOnError: true });
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

    // 2. CW20 Pair Info query (optional; pool might not support pair_info query)
    try {
      const queryBase64 = Buffer.from(JSON.stringify({ pair_info: {} })).toString('base64');
      const pairRes = await queryRest(`/cosmwasm/wasm/v1/contract/${pool}/smart/${queryBase64}`, {
        throwOnError: false,
      });
      const pData = pairRes?.data;

      if (pData) {
        if (pData.token_b && pData.token_b.startsWith('luxa1') && pData.reserve_b && pData.reserve_b !== '0') {
          api.add(pData.token_b, pData.reserve_b);
        }
        if (pData.token_a && pData.token_a.startsWith('luxa1') && pData.reserve_a && pData.reserve_a !== '0') {
          api.add(pData.token_a, pData.reserve_a);
        }
      }
    } catch (_) {
      // Optional smart query failed
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
