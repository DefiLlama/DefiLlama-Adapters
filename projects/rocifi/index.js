const sdk = require("@defillama/sdk");
const v1 = require("./v1");
const v2 = require("./v2");

const chain = "polygon";

module.exports = {
  [chain]: {
    tvl: sdk.util.sumChainTvls([v1[chain].tvl, v2[chain].tvl]),
    borrowed: sdk.util.sumChainTvls([v1[chain].borrowed, v2[chain].borrowed]),
  },
};
