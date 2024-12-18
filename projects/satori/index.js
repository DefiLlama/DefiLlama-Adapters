const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokensExport: sumTokensExportOfTon } = require("../helper/chain/ton");

const ethereum_LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";
const ethereum_PumpBTC = "0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e";
const base_PumpBTC = "0x23dA5F2d509cb43A59d43C108a43eDf34510eff1";
const stBTC = "0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3";

module.exports = {
  methodology:
    "Counts Satori smartcontract balance as TVL..",
  polygon_zkevm: {
    tvl: sumTokensExport({
      owners: [
        "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
        "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
      ],
      tokens: [ADDRESSES.astarzk.USDT],
    }),
  },
  era: {
    tvl: sumTokensExport({
      owners: [
        "0x0842b33529516abe86CA8EA771aC4c84FDd0eeE0",
        "0x48756b37Fd643bB40F669804730024F02900C476",
      ],
      tokens: [ADDRESSES.era.USDC, ADDRESSES.era.ZK],
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owners: [
        "0xfb371E70eEB32f4054F40514924e77213ca18425",
        "0xF96116e124eB3F62Ddc6a9cfbdc58d7F8A37c50A",
      ],
      tokens: [ADDRESSES.linea.USDC, ADDRESSES.blast.ezETH],
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
      tokens: [ADDRESSES.base.USDC, ADDRESSES.blast.ezETH,base_PumpBTC],
    }),
  },
  xlayer: {
    tvl: sumTokensExport({
      owners: [
        "0x80DD5bC934122e56B9536a9F19F2Ea95a38E98c8",
        "0xf915391346Fad5a75F31CD00218BB1EFC13e01f2",
      ],
      tokens: [ADDRESSES.xlayer.USDC],
    }),
  },
  arbitrum:{
    tvl: sumTokensExport({
      owners: [
        "0x5aCCEb99De5cc07168C193396C1fdC3E3abEEED7",
        "0xAE9a83510cbB26c58595BA671f131e0A03Fe9A03",
      ],
      tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
    }),
  },
  ton:{
    tvl: sumTokensExportOfTon({
      owners: [
        "EQDrGCJ3V8cMw92Gg8Tf9nfq3piaT_iI3EkCGVF0OUG0vWEh",
      ],
      tokens: [ADDRESSES.ton.USDT],
    }),
  },
  bsc:{
    tvl: sumTokensExport({
      owners: [
        "0x3b6F3f7F0e3e8cCa7bC11dFA4a8567A6479Ece54",
        "0xD2F244164cd09e5cBb6360c4a17aAF976a34562a"
      ],
      tokens: [ADDRESSES.bsc.USDC,stBTC],
    }),
  },
  ethereum:{
    tvl: sumTokensExport({
      owners: [
        "0x0857f8a6e41e1c71f4065daebfe7ddb825cbffde",
        "0xA394080628F175472Fee9eB316BD104fAB63FE40"
      ],
      tokens: [ADDRESSES.ethereum.USDC,ethereum_LBTC,stBTC,ethereum_PumpBTC],
    }),
  }
};
