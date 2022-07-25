const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xac15fe2C74bD635EfAF687F302633C7e5EbfF973) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  rei: {
    tvl: getUniTVL({
      chain: 'rei',
      factory: '0xac15fe2C74bD635EfAF687F302633C7e5EbfF973',
      coreAssets: [
        '0x2545af3d8b11e295bb7aedd5826021ab54f71630', // WREI
        '0x988a631caf24e14bb77ee0f5ca881e8b5dcfcec7',  // USDT
        '0x8059e671be1e76f8db5155bf4520f86acfdc5561',  // WBTC
      ]
    })
  },
}; // node test.js projects/oortswap/index.js