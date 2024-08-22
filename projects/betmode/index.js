const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "TVL is the total quantity of USDC held in the contract",
  mode: {
    tvl: sumTokensExport({
      owners: ["0xeb5D5af6a0ac3B64243858094d6b3b379B8772Aa"],
      tokens: [ADDRESSES.mode.USDC],
    }),
  },
};
