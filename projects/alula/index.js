const { callSoroban } = require('../helper/chain/stellar')
const methodologies = require('../helper/methodologies')

// Alula — institutional-grade RWA lending protocol on Stellar/Soroban.
// Mainnet Market contract (see the protocol's published deployments).
const MARKET = 'CBP76I2FRMUKYKIYYBKN3DH7TSWMFAJF2WTDC7Q2OHQFBIVWP7CAAI5Q'

// [{ token, total_borrowed }] for every pool currently registered in the market.
// Discovered fresh on every call so newly added pools are always included and a
// transient RPC failure simply propagates and retries on the next collection.
// get_all_pools() -> Vec<Address>; get_pool(pool) -> Pool { token_address, total_borrowed, ... }
async function getPools() {
  const out = []
  for (const pool of await callSoroban(MARKET, 'get_all_pools')) {
    const { token_address, total_borrowed } = await callSoroban(MARKET, 'get_pool', [pool])
    out.push({ token: token_address, total_borrowed })
  }
  return out
}

// tvl: underlying tokens actually held by the market contract (available liquidity +
// plain collateral). Borrowed tokens have left the contract, so reading the on-chain
// balance avoids double-counting Earn/Multiply receipt positions.
async function tvl(api) {
  const seen = new Set()
  for (const { token } of await getPools()) {
    if (seen.has(token)) continue // one pool per token; dedupe defensively
    seen.add(token)
    api.add(token, (await callSoroban(token, 'balance', [MARKET])).toString())
  }
}

// borrowed: outstanding debt per pool. total_borrowed is already denominated in
// underlying token units (raw i128), so no share-rate conversion is needed.
async function borrowed(api) {
  for (const { token, total_borrowed } of await getPools()) {
    api.add(token, total_borrowed.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is the underlying token balances held by the Alula market contract across all pools; borrowed is each pool's outstanding debt (total_borrowed).`,
  stellar: { tvl, borrowed },
}
