const { gql, GraphQLClient } = require("graphql-request");
const { stakings } = require("../helper/staking");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

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

const bscClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/toadguy/padswap"
);
const movrClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/toadguy/padswap-subgraph-moonriver"
);

module.exports = {
  methodology: `TVL accounts for the liquidity on all AMM pools (see https://info.padswap.exchange/ and https://movr-info.padswap.exchange/). Staking includes all TOAD staked in TOAD farms.`,
  misrepresentedTokens: true,
  bsc: {
    tvl: calculateUsdUniTvl(PADSWAP_BSC_FACTORY_ADDRESS, "bsc", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", [
      "0x463e737d8f740395abf44f7aac2d9531d8d539e9", //toad
      "0xc0888d80ee0abf84563168b3182650c0addeb6d5", //pad
    ], "wbnb"),
    staking: stakings([TOAD_PADSWAP_FARM_V1_ADDRESS, TOAD_PADSWAP_FARM_V2_ADDRESS], TOAD_ADDRESS, "bsc"),
  },
  moonriver:{
    tvl: calculateUsdUniTvl(PADSWAP_MOONRIVER_FACTORY_ADDRESS, "moonriver", "0x663a07a2648296f1a3c02ee86a126fe1407888e5", [
      "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", //usdc
      "0x45488c50184ce2092756ba7cdf85731fd17e6f3d", //pad
    ], "moonriver"),
  }
};
