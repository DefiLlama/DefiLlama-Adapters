const { get } = require('../helper/http')

// CCTools is an independent Canton DeFi aggregator. Its public API reports
// per-pool USD TVL for every Pool Party pool, including the stablecoin sides
// (USDCx, CUSD) that the Lighthouse API does not expose.
const POOLS_URL = 'https://api.cctools.network/api/markets/send/pools'

async function tvl(api) {
  const pools = await get(POOLS_URL)
  for (const pool of pools) {
    if (pool.status === 'live') api.addUSDValue(Number(pool.tvlUsd))
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "Sum of USD-denominated liquidity across Pool Party's live pools " +
    "(CC/USDCx, CC/CUSD, CUSD/USDCx), via the CCTools API — an independent " +
    "Canton DeFi aggregator that indexes the stablecoin sides (USDCx, CUSD) " +
    "in addition to Canton Coin.",
}
