const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  methodology: "TVL consists of assets deposited into the Sonic Market AMM contract",
  sonic: {
    tvl: getUniTVL({
      factory: "0x01D6747dD2d65dDD90FAEC2C84727c2706ee28E2",
      useDefaultCoreAssets: true,
    }),
  }
};
