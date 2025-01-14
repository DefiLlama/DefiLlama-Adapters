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
  base: {
    tvl: sumTokensExport({
      owners: ["0x1C6971510c02eAe2e0a7d02A51193fE0b7286De4"],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owners: ["0x4b9d8f10bB6F50765DbeB9F8FBBF3Dace0Db8f3c"],
      tokens: [ADDRESSES.optimism.USDC_CIRCLE],
    }),
  },
};
