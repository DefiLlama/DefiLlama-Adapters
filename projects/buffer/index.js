const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");

const tokens = {
  BFR: "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D",
  USDC_ARB: ADDRESSES.arbitrum.USDC,
  USDC_POLY: ADDRESSES.polygon.USDC,
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548"
};

const contracts = {
  USDC_POOL_V1: "0x37Cdbe3063002383B2018240bdAFE05127d36c3C",
  USDC_POOL_V2: "0x4d338bc1a2380752736718f49bd45d9a040fdff8",
  USDC_POOL_V3: "0x6Ec7B10bF7331794adAaf235cb47a2A292cD9c7e",
  USDC_POOL_V4: "0xfD9f8841C471Fcc55f5c09B8ad868BdC9eDeBDE1",
  POLY_POOL_V1: "0x6FD5B386d8bed29b3b62C0856250cdD849b3564d",
  ARB_POOL_V1: "0xaE0628C88EC6C418B3F5C005f804E905f8123833",
  BFR_STAKING: "0x173817F33f1C09bCb0df436c2f327B9504d6e067"
};

module.exports = {
  arbitrum: {
    staking: staking(contracts.BFR_STAKING, tokens.BFR),
    tvl: sumTokensExport({
      tokens: [tokens.USDC_ARB, tokens.ARB],
      owners: [
        contracts.USDC_POOL_V1,
        contracts.USDC_POOL_V2,
        contracts.USDC_POOL_V3,
        contracts.ARB_POOL_V1,
        contracts.USDC_POOL_V4
      ]
    })
  },
  polygon: {
    tvl: sumTokensExport({
      tokens: [tokens.USDC_POLY],
      owners: [contracts.POLY_POOL_V1]
    })
  },
  hallmarks: [
    [Math.floor(new Date("2022-10-26") / 1e3), "Shifted to USDC POL pool"],
    [
      Math.floor(new Date("2023-01-30") / 1e3),
      "Opened USDC BLP pool to the public"
    ],
    [Math.floor(new Date("2023-02-22") / 1e3), "Added a USDC Pool on polygon"],
    [Math.floor(new Date("2023-03-22") / 1e3), "Added ARB Pool"],
    [Math.floor(new Date("2023-04-14") / 1e3), "Added USDC Protocol owned liquidity Pool"],
  ]
};
