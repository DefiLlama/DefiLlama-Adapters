const { stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const TOAD_ADDRESS = "0x463e737d8f740395abf44f7aac2d9531d8d539e9";
const TOAD_FARM_ADDRESS = "0xe1F1EDfBcEfB1E924e4a031Ed6B4CAbC7e570154";
const TOAD_PADSWAP_FARM_V1_ADDRESS =
  "0xD2d7b6b333AbF180520494c021f7125806eD273e";
const TOAD_PADSWAP_FARM_V2_ADDRESS =
  "0x4992df071416370fe780627eDFDD8CbC694Ed08b";

const PADSWAP_BSC_FACTORY_ADDRESS =
  "0xB836017ACf10b8A7c6c6C9e99eFE0f5B0250FC45";
const PADSWAP_MOONRIVER_FACTORY_ADDRESS =
  "0x760d2Bdb232027aB3b1594405077F9a1b91C04c1";
const PADSWAP_MOONBEAM_FACTORY_ADDRESS =
  "0x663a07a2648296f1A3C02EE86A126fE1407888E5";

module.exports = {
  hallmarks: [
    [1659312000,"Nomad Bridge Exploit"],
  ],
  methodology: `TVL accounts for the liquidity on all AMM pools (see https://info.padswap.exchange/ and https://movr-info.padswap.exchange/). Staking includes all TOAD staked in TOAD farms.`,
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: PADSWAP_BSC_FACTORY_ADDRESS, useDefaultCoreAssets: true, blacklistedTokens: ['0xcdb943908de5ee37998a53f23467017d1a307e60'], }), 
    staking: stakings(
      [
        TOAD_FARM_ADDRESS,
        TOAD_PADSWAP_FARM_V1_ADDRESS,
        TOAD_PADSWAP_FARM_V2_ADDRESS,
      ],
      TOAD_ADDRESS,
      "bsc"
    ),
  },
  moonriver: {
    tvl: getUniTVL({ factory: PADSWAP_MOONRIVER_FACTORY_ADDRESS, useDefaultCoreAssets: true, }), 
  },
  moonbeam: {
    tvl: getUniTVL({ factory: PADSWAP_MOONBEAM_FACTORY_ADDRESS, useDefaultCoreAssets: true, }),
  }
};
