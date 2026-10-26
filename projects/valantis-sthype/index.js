const { STHYPE, WHYPE, DEPLOYMENTS } = require('../helper/valantis')

module.exports = {
  start: '2025-02-18',
  methodology: 'Counts circulating stHYPE supply in redeemable HYPE units. Excludes burned withdrawal claims and protocol fee liabilities.',
  hyperliquid: {
    tvl: async (api) => {
      if (await api.getBlock() < DEPLOYMENTS.sthype) return
      api.add(WHYPE, await api.call({ target: STHYPE, abi: 'uint256:totalSupply' }))
    },
  },
}
