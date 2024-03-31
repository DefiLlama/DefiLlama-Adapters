const { getCache, } = require('../helper/http')

async function tvl(api) {
  const pools = await getCache('https://midgard.ninerealms.com/v2/pools')
  pools.map(({ totalCollateral = 0 }) => {
    api.addCGToken('thorchain', totalCollateral / 1e6)
  })
  return api.getBalances()
}

module.exports = {
  hallmarks: [
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
  ],
  timetravel: false,
  thorchain: { tvl, },
}