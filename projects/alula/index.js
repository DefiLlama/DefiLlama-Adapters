const { callSoroban } = require('../helper/chain/stellar')
const methodologies = require('../helper/methodologies')

// Alula — institutional-grade RWA lending protocol on Stellar/Soroban.
// Mainnet Market contracts: the current main market and the deprecated one, which still
// holds positions until its users withdraw (see the protocol's published deployments).
const MARKETS = [
  'CCA56KMCEEAK2SGMHNU7TYJUO7GP5KSDTTFB6ZS2NQY7VQ3SKWLMTEB4',
  'CBP76I2FRMUKYKIYYBKN3DH7TSWMFAJF2WTDC7Q2OHQFBIVWP7CAAI5Q',
]

// [{ token, total_borrowed }] for every pool currently registered in the market.
// Discovered fresh on every call so newly added pools are always included and a
// transient RPC failure simply propagates and retries on the next collection.
// get_all_pools() -> Vec<Address>; get_pool(pool) -> Pool { token_address, total_borrowed, ... }
async function getPools(market) {
  const out = []
  for (const pool of await callSoroban(market, 'get_all_pools')) {
    const { token_address, total_borrowed } = await callSoroban(market, 'get_pool', [pool])
    out.push({ token: token_address, total_borrowed })
  }
  return out
}

// tvl: underlying tokens actually held by each market contract (available liquidity +
// plain collateral). Borrowed tokens have left the contract, so reading the on-chain
// balance avoids double-counting Earn/Multiply receipt positions.
async function tvl(api) {
  for (const market of MARKETS) {
    const seen = new Set()
    for (const { token } of await getPools(market)) {
      if (seen.has(token)) continue // one pool per token; dedupe defensively
      seen.add(token)
      api.add(token, (await callSoroban(token, 'balance', [market])).toString())
    }
  }
}

// borrowed: outstanding debt per pool. total_borrowed is already denominated in
// underlying token units (raw i128), so no share-rate conversion is needed.
async function borrowed(api) {
  for (const market of MARKETS) {
    for (const { token, total_borrowed } of await getPools(market)) {
      api.add(token, total_borrowed.toString())
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is the underlying token balances held by the Alula market contracts across all pools; borrowed is each pool's outstanding debt (total_borrowed).`,
  stellar: { tvl, borrowed },
}
