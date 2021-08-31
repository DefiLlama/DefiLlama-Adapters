const sdk = require("@defillama/sdk");
const v1 = require('./v1')
const v2 = require('./v2')

module.exports = {
  methodology: 'TVL considers v1 and v2 deposits made to the farming strategies as well as the liquidity on the DEX that is calculated using the factory address (0xEAA98F7b5f7BfbcD1aF14D0efAa9d9e68D82f640)',
  tvl: sdk.util.sumChainTvls([v1.tvl, v2.tvl]),
};
