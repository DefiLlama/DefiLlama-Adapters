// Cook Market is a memecoin launchpad on Robinhood Chain. Every launch opens a Uniswap v4 pool
// guarded by CookHook, which runs the bonding curve and then graduates the pool in place.
// https://cook.market
// CookHook: https://robinhoodchain.blockscout.com/address/0xfe3eFA722DCAB53e87E94593cB41Bc706C1E3044

// No TVL is reported: a coin never leaves its pool. The bonding-curve reserve sits in the Uniswap
// v4 PoolManager from the first swap and stays there through graduation, so every dollar is
// already counted by the uniswap-v4 listing on this chain. Volume and fees are tracked separately
// in dimension-adapters/fees/cook-market.
module.exports = {
  methodology:
    'Cook Market reports no TVL of its own. Launches trade on Uniswap v4 pools from the first swap, so the quote asset backing each coin lives in the v4 PoolManager and is already counted under Uniswap v4 on Robinhood Chain. Counting it here as well would double count it.',
  robinhood: {
    tvl: () => ({}),
  },
}
