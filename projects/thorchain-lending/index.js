const { getCache, } = require('../helper/http')
const sdk = require("@defillama/sdk");

async function tvl(_, _1, _2) {
  const pools = await getCache('https://midgard.ninerealms.com/v2/pools')

  const balances = {}

  pools.map(({ totalCollateral, assetPrice }) => {
    if (totalCollateral > 0) {
      sdk.util.sumSingleBalance(balances, 'thorchain', (Number(totalCollateral) / 1e8)* Number(assetPrice))
    }
  })

  return balances
}

module.exports = {
  hallmarks: [
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
  ],
  timetravel: false,
  thorchain: { tvl, },
}