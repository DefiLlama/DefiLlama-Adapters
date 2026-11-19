const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// Sherwood (sherwood.pfwa.fun, part of PFWA): a PvP arena game built into Uniswap v4 hooks on Robinhood Chain.
// Each season's hook keeps the game's money in its own ETH balance: the round pots, prizes and referral rewards not claimed yet,
// and the ETH set aside for the $PFWA / $IMD buyback-and-burns.
// The pools' liquidity sits in the Uniswap v4 PoolManager, belongs to the LPs and is Uniswap's TVL, so it is not counted.
const HOOKS = [
  '0x0C9DDD9E45817252D56f70ec015A4E828212a0cc', // Season 1, ETH/$PFWA pool
  '0xc33c907127b94303F578d6Be551C36F45939e0cC', // Season 2, ETH/$IMD pool
]

async function tvl(api) {
  return sumTokens2({ api, owners: HOOKS, tokens: [nullAddress] })
}

module.exports = {
  methodology: 'Counts the native ETH held by the Sherwood game hooks (Season 1 on the ETH/$PFWA pool, Season 2 on the ETH/$IMD pool): round pots, unclaimed prizes and referral rewards, and the ETH reserved for buyback-and-burns. Liquidity in the Uniswap v4 pools is not counted, since it belongs to the LPs and is already part of Uniswap\'s TVL.',
  start: '2026-10-08',
  robinhood: { tvl },
}
