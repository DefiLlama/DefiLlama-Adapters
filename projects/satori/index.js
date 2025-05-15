const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokensExport: sumTokensExportOfTon } = require("../helper/chain/ton");

const ethereum_LBTC = ADDRESSES.ethereum.LBTC;
const ethereum_PumpBTC = "0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e";
const base_PumpBTC = "0x23dA5F2d509cb43A59d43C108a43eDf34510eff1";
const stBTC = ADDRESSES.swellchain.stBTC;

module.exports = {
  methodology:
    "Counts Satori smartcontract balance as TVL..",
  polygon_zkevm: {
    tvl: sumTokensExport({
      owners: [
        "0x62e724cB4d6C6C7317e2FADe4A03001Fe7856940",
        "0xA59a2365D555b24491B19A5093D3c99b119c2aBb",
      ],
      tokens: [ADDRESSES.astarzk.USDT,ADDRESSES.astarzk.MATIC],
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
  zircuit:{
    tvl: sumTokensExport({
      owners: [
        "0x301A29D92B23750c481D6F2feAA01F872561A528",
        "0x8DdCb1F874e635E03f172cc02B4F57ae94Ae7BC0"
      ],
      tokens: ["0x3b952c8C9C44e8Fe201e2b26F6B2200203214cfF",ADDRESSES.zircuit.WETH],
    }),
  },
  sty:{
    tvl: sumTokensExport({
      owners: [
        "0x0848F4AE872545C901D3325AEFf09F0fa8952AfC",
        "0x133A54E116731c0CBE35EE41276D570e0730E92D"
      ],
      tokens: [ADDRESSES.flow.stgUSDC,"0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8"],
    }),
  },
  plume:{
    tvl: sumTokensExport({
      owners: [
        "0x04AE748272c3959A9904aeaD3cc00AAf476aa34D",
        "0x36Bd86676A05ABAaF30D57F65Ba463669E018F3e"
      ],
      tokens: [ADDRESSES.plume.USDC_e,ADDRESSES.plume_mainnet.pUSD,"0xD630fb6A07c9c723cf709d2DaA9B63325d0E0B73","0x81537d879ACc8a290a1846635a0cAA908f8ca3a6","0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9","0x892DFf5257B39f7afB7803dd7C81E8ECDB6af3E8","0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"],
    }),
  },
  plume_mainnet: {
    tvl: sumTokensExport({
      owners: [
        "0x04AE748272c3959A9904aeaD3cc00AAf476aa34D",
        "0x36Bd86676A05ABAaF30D57F65Ba463669E018F3e"
      ],
      tokens: [ADDRESSES.plume_mainnet.WPLUME,ADDRESSES.plume_mainnet.pUSD,ADDRESSES.plume_mainnet.USDC_e,ADDRESSES.plume_mainnet.USDT,"0x11a8d8694b656112d9a94285223772F4aAd269fc","0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9","0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"],
    }),
  },
  ethereum:{
    tvl: sumTokensExport({
      owners: [
        "0x0857f8a6e41e1c71f4065daebfe7ddb825cbffde",
        "0xA394080628F175472Fee9eB316BD104fAB63FE40"
      ],
      tokens: [ADDRESSES.ethereum.USDC,ethereum_LBTC,stBTC,ethereum_PumpBTC,ADDRESSES.ethereum.STETH,ADDRESSES.ethereum.WSTETH,ADDRESSES.ethereum.cbETH,ADDRESSES.ethereum.EETH,ADDRESSES.ethereum.RETH,"0xa2e3356610840701bdf5611a53974510ae27e2e1","0xa1290d69c65a6fe4df752f95823fae25cb99e5a7","0xe95a203b1a91a908f9b9ce46459d101078c2c3cb","0x09db87A538BD693E9d08544577d5cCfAA6373A48"],
    }),
  }
};
