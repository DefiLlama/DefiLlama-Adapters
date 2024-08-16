const sdk = require("@defillama/sdk");
const rmmTVL = require('./rmm')
const v1TVL = require('./v1')

module.exports = {
  ethereum: {
    start: 1647932400, // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl: sdk.util.sumChainTvls([rmmTVL, v1TVL, ]), // 
  },
}