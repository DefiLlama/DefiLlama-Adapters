const sdk = require('@defillama/sdk')
const v1TVL = require('./convexity');
const v2TVL = require('./gamma');

module.exports = {
  start: 1581542700,  // 02/12/2020 @ 09:25PM (UTC)
  tvl: sdk.util.sumChainTvls([v1TVL, v2TVL]),
  hallmarks: [
    [1619493707, "Ribbon launch"]
  ]
}
