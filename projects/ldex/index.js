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
 * Resilient GET helper with automatic multi-endpoint fallback
 */
async function queryRest(path) {
  for (const base of REST_ENDPOINTS) {
    try {
      const url = `${base}${path}`;
      const res = await get(url);
      if (res) return res;
    } catch (_) {
      // Try next endpoint on network timeout or transient error
    }
  }
  return null;
}

/**
 * Fetch all deployed pool contract addresses on luxa-1
 */
async function getPoolAddresses() {
  const pools = new Set([GENESIS_POOL]);

  for (const codeId of PAIR_CODE_IDS) {
    try {
      const res = await queryRest(`/cosmwasm/wasm/v1/code/${codeId}/contracts`);
      if (res && Array.isArray(res.contracts)) {
        for (const addr of res.contracts) {
          if (addr && addr.startsWith('luxa1')) {
            pools.add(addr);
          }
        }
      }
    } catch (_) {
      // Continue with remaining code IDs if one fails
    }
  }

  return Array.from(pools);
}

/**
 * Main TVL calculation function for DefiLlama SDK v2
 */
async function tvl(api) {
  const pools = await getPoolAddresses();

  for (const pool of pools) {
    try {
      // 1. Query Cosmos SDK Bank reserves (native coins: uluxa, ushard, ibc/...)
      const bankRes = await queryRest(`/cosmos/bank/v1beta1/balances/${pool}`);
      if (bankRes && Array.isArray(bankRes.balances)) {
        for (const coin of bankRes.balances) {
          if (coin.denom && coin.amount && coin.amount !== '0') {
            api.add(coin.denom, coin.amount);
          }
        }
      }

      // 2. Query CW20 Pair Info for token contracts (e.g. Code 4 AMM pools)
      try {
        const queryBase64 = Buffer.from(JSON.stringify({ pair_info: {} })).toString('base64');
        const pairRes = await queryRest(`/cosmwasm/wasm/v1/contract/${pool}/smart/${queryBase64}`);
        const pData = pairRes?.data;

        if (pData) {
          // If token_b is a CW20 contract and has reserve locked
          if (pData.token_b && pData.token_b.startsWith('luxa1') && pData.reserve_b && pData.reserve_b !== '0') {
            api.add(pData.token_b, pData.reserve_b);
          }
          // If token_a is a CW20 contract and has reserve locked
          if (pData.token_a && pData.token_a.startsWith('luxa1') && pData.reserve_a && pData.reserve_a !== '0') {
            api.add(pData.token_a, pData.reserve_a);
          }
        }
      } catch (_) {
        // Pool does not implement pair_info (e.g. Genesis Code 1 pair)
      }

    } catch (_) {
      // Skip failed pool to ensure continuous execution without crash
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
