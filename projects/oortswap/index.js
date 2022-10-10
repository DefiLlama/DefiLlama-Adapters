const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xac15fe2C74bD635EfAF687F302633C7e5EbfF973) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  rei: {
    tvl: getUniTVL({
      chain: 'rei',
      factory: '0xac15fe2C74bD635EfAF687F302633C7e5EbfF973',
      useDefaultCoreAssets: true,
    })
  },
}; // node test.js projects/oortswap/index.js