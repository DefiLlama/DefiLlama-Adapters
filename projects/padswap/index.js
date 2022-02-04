const { stakings } = require("../helper/staking");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { getChainTvlBuffered } = require("../helper/getUniSubgraphTvl");
const { getBlock } = require("../helper/getBlock");

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

const SUBGRAPH_BUFFER_DELAY = 10 * 60; // 10 minutes

const subgraphTvls = getChainTvlBuffered(
  {
    bsc: "https://subgraph.toadlytics.com:8080/subgraphs/name/padswap-subgraph",
    moonriver:
      "https://api.thegraph.com/subgraphs/name/toadguy/padswap-subgraph-moonriver",
  },
  SUBGRAPH_BUFFER_DELAY
);

module.exports = {
  methodology: `TVL accounts for the liquidity on all AMM pools (see https://info.padswap.exchange/ and https://movr-info.padswap.exchange/). Staking includes all TOAD staked in TOAD farms.`,
  misrepresentedTokens: true,
  bsc: {
    //subgraphTvls("bsc"),
    tvl: calculateUsdUniTvl(
      PADSWAP_BSC_FACTORY_ADDRESS,
      "bsc",
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      [
        "0x463e737d8f740395abf44f7aac2d9531d8d539e9", //toad
        "0xc0888d80ee0abf84563168b3182650c0addeb6d5", //pad
      ],
      "wbnb"
    ),

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
    //subgraphTvls("moonriver"),
    tvl: calculateUsdUniTvl(
      PADSWAP_MOONRIVER_FACTORY_ADDRESS,
      "moonriver",
      "0x663a07a2648296f1a3c02ee86a126fe1407888e5",
      [
        "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", //usdc
        "0x45488c50184ce2092756ba7cdf85731fd17e6f3d", //pad
      ],
      "moonriver"
    ),
  },
  moonbeam: {
    tvl: calculateUsdUniTvl(
      PADSWAP_MOONBEAM_FACTORY_ADDRESS,
      "moonbeam",
      "0xe3db50049c74de2f7d7269823af3178cf22fd5e3",
      [
        "0x59193512877E2EC3bB27C178A8888Cfac62FB32D", //pad
        "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055", //bnb
        "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594", //tether
        "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", //usdc
        "0xF480f38C366dAaC4305dC484b2Ad7a496FF00CeA", //toad
      ],
      "moonbeam"
    ),
  }
};
