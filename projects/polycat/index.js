const sdk = require("@defillama/sdk");
const v1 = require('./v1')
const v2 = require('./v2')

module.exports = {
  tvl: sdk.util.sumChainTvls([v1.tvl, v2.tvl]),
};
