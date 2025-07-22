const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require("../helper/staking");

const FACTORIES = "0xA9473608514457b4bF083f9045fA63ae5810A03E";

module.exports = {
  misrepresentedTokens: true,
  astar: {
    tvl: getUniTVL({ factory: FACTORIES, useDefaultCoreAssets: true, }),
    staking: staking('0x42d175a498Cb517Ad29d055ea7DcFD3D99045404', '0xde2578edec4669ba7f41c5d5d2386300bcea4678'),
  },
};
