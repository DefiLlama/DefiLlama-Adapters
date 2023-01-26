const { sumTokensExport, } = require("../helper/unwrapLPs.js");
const { tokensBare: tokens } = require("../helper/tokenMapping");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1",
      tokens: [
        tokens.weth,
        tokens.wbtc,
        tokens.usdc,
        tokens.dai,
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", // wseth
      ],
    }),
  },
};
