const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDT_TOKEN_CONTRACT = "0x1E4a5963aBFD975d8c9021ce480b42188849D41d";
const WALLET_ADDR = [
  "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
  "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
];
module.exports = {
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  polygon_zkevm: {
    tvl: sumTokensExport({ owners: WALLET_ADDR, tokens: [USDT_TOKEN_CONTRACT]}),
  },
  era: {
    tvl: sumTokensExport({
      owners: [
        "0x0842b33529516abe86CA8EA771aC4c84FDd0eeE0",
        "0x48756b37Fd643bB40F669804730024F02900C476",
      ],
      tokens: [ADDRESSES.era.USDC],
    }),
  },
};
