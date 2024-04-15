const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const USDT_TOKEN_CONTRACT = ADDRESSES.astarzk.USDT;
const WALLET_ADDR = [
  "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
  "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
];
module.exports = {
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  polygon_zkevm: {
    tvl: sumTokensExport({
      owners: WALLET_ADDR,
      tokens: [USDT_TOKEN_CONTRACT],
    }),
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
  linea: {
    tvl: sumTokensExport({
      owners: [
        "0xfb371E70eEB32f4054F40514924e77213ca18425",
        "0xF96116e124eB3F62Ddc6a9cfbdc58d7F8A37c50A",
      ],
      tokens: [ADDRESSES.linea.USDC],
    }),
  },
  scroll: {
    tvl: sumTokensExport({
      owners: [
        "0xfb371E70eEB32f4054F40514924e77213ca18425",
        "0xF96116e124eB3F62Ddc6a9cfbdc58d7F8A37c50A",
      ],
      tokens: [ADDRESSES.scroll.USDC],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: [
        "0x668a9711b8d04362876dc5b6177ed362084d5aed",
        "0x5f075a6a11B2e25DF664Ce7419c274943017B595",
      ],
      tokens: [ADDRESSES.base.USDC],
    }),
  },
}