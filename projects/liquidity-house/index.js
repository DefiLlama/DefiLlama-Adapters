const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "TVL is the total quantity of USDC held in the contract",
  etherlink: {
    tvl: sumTokensExport({
      owners: ["0x0c532e1e916219007f244e2d8Ef46f8530Ec75DE"],
      tokens: [ADDRESSES.etherlink.USDC],
    }),
  },
};
