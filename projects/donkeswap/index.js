const { getUniTVL } = require("../helper/unknownTokens");

// node test.js projects/donkswap/index.js
module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address (0x4B4746216214f9e972c5D35D3Fe88e6Ec4C28A6B) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  sei: {
    tvl: getUniTVL({ factory: "0x4B4746216214f9e972c5D35D3Fe88e6Ec4C28A6B", useDefaultCoreAssets: true })
  }
};
