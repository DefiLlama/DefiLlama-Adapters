const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "TVL is the total quantity of USDC held in the contract",
  etlk: {
    tvl: sumTokensExport({
      owners: ["0x0c532e1e916219007f244e2d8Ef46f8530Ec75DE"],
      tokens: [ADDRESSES.etlk.USDC],
    }),
  },
};
