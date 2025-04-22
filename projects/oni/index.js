const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking");

const OniFactory = "0xED13950fD0a2E10788E830e60CFA0D018125310e";
const OniToken = "0x6c77BB19C69d66bEA9E3CDAea108A76eA8D2Fd2A";
const MasterChef = "0xE93fC7e6103EF86F3329635B8197D462B74F0cb8";

module.exports = {
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://info.oni.exchange/ as the source. Staking accounts for ONI locked in MasterChef (0xE93fC7e6103EF86F3329635B8197D462B74F0cb8)",
  bsc: {
    tvl: getUniTVL({ factory: OniFactory, useDefaultCoreAssets: true }),
    staking: stakingPricedLP(
      MasterChef,
      OniToken,
      "bsc",
      "0x7A070189A28875aC936F517A9d452248619F0CA6",
      "wbnb",
      true
    ),
  },
};
