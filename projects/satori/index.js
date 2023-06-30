const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");
module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
      "TVL includes the total token value inside the protocol's liquidity pools.",
  polygon_zkevm: {
    tvl: sumTokensExport({
      chain: "polygon_zkevm",
      owners: [
        "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
        "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
      ],
      tokens: ["0x1E4a5963aBFD975d8c9021ce480b42188849D41d"],
    }),
  },
  era: {
    tvl: sumTokensExport({
      chain: "era",
      owners: [
        "0x0842b33529516abe86CA8EA771aC4c84FDd0eeE0",
        "0x48756b37Fd643bB40F669804730024F02900C476",
      ],
      tokens: ["0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4"],
    }),
  },
};