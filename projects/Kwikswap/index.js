const { getChainTvlBuffered } = require("../helper/getUniSubgraphTvl");
const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require("../helper/staking.js");

const v1graph = getChainTvlBuffered(
  {
    ethereum:
      "https://api.thegraph.com/subgraphs/name/kwikswap/kwikswap-subgraph",
    bsc: "https://api.thegraph.com/subgraphs/name/kwikswap/kwikswap-bsc-subgraph",
    polygon: "https://api.thegraph.com/subgraphs/name/kwikswap/matic-exchange",
  },
  600,
  "kwikswapFactories",
  "totalLiquidityUSD"
);
// node test.js projects/kwikswap/index.js
const KWIK_TOKEN_ADDRESSES = {
  ethereum: "0x286c0936c7eaf6651099ab5dab9ee5a6cb5d229d",
  shiden: "0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454",
  polygon: "0x8df74088b3aecfd0cb97bcfd053b173782f01e3a",
};

const STAKING_CONTRACTS = {
  ethereum: "0x57Caec63E87e1496E946181e3Fc59086e589D4c0",
  shiden: "0x212CB413c48221cA6fE2100578a9ABED26840380",
  polygon: "0x7965e5F759caB3d5a1b737b9Bb24e94ef6747FA7",
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: v1graph("ethereum"),
    staking: staking(
      STAKING_CONTRACTS["ethereum"],
      KWIK_TOKEN_ADDRESSES["ethereum"]
    ),
  },

  polygon: {
    tvl: v1graph("polygon"),
    staking: staking(
      STAKING_CONTRACTS["polygon"],
      KWIK_TOKEN_ADDRESSES["polygon"],
      "polygon"
    ),
  },
  shiden: {
    tvl: getUniTVL({
      factory: '0xf5fC2D145381A2eBAFb93Cc2B60fB2b97FB405aa',
      chain: 'shiden',
      coreAssets: ['0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef',
        // USDC
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
        // USDT
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
        // JPYC
        "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F",
        // STND
        "0x722377A047e89CA735f09Eb7CccAb780943c4CB4",],
    }),
    staking: staking(
      STAKING_CONTRACTS["shiden"],
      KWIK_TOKEN_ADDRESSES["shiden"],
      "shiden",
      KWIK_TOKEN_ADDRESSES["ethereum"]
    ),
  },
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      coreAssets: ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
      factory: '0x64eBD6CaCece790e9C4DDeA1a24952Ddb2715279',
    }),
  },
}
