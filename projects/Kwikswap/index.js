const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { staking } = require("../helper/staking.js");

const v1graph = getChainTvl(
  {
    ethereum:
      "https://api.thegraph.com/subgraphs/name/kwikswap/kwikswap-subgraph",
    bsc: "https://api.thegraph.com/subgraphs/name/kwikswap/kwikswap-bsc-subgraph",
  },
  "kwikswapFactories",
  "totalLiquidityUSD"
);

const KWIK_TOKEN_ADDRESSES = {
  ethereum: "0x286c0936c7eaf6651099ab5dab9ee5a6cb5d229d",
  shiden: "0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454",
};

const STAKING_CONTRACTS = {
  ethereum: "0x57Caec63E87e1496E946181e3Fc59086e589D4c0",
  shiden: "0x212CB413c48221cA6fE2100578a9ABED26840380",
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: v1graph("ethereum"),
    staking: staking(
      STAKING_CONTRACTS["ethereum"],
      KWIK_TOKEN_ADDRESSES["ethereum"]
    ),
  },
  shiden: {
    tvl: calculateUsdUniTvl(
      "0xf5fC2D145381A2eBAFb93Cc2B60fB2b97FB405aa",
      "shiden",
      "0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef",
      [
        // USDC
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
        // USDT
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
        // JPYC
        "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F",
        // STND
        "0x722377A047e89CA735f09Eb7CccAb780943c4CB4",
      ],
      "shiden"
    ),
    staking: staking(
      STAKING_CONTRACTS["shiden"],
      KWIK_TOKEN_ADDRESSES["shiden"],
      "shiden",
      KWIK_TOKEN_ADDRESSES["ethereum"],
      0
    )
  },
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x64eBD6CaCece790e9C4DDeA1a24952Ddb2715279",
      "bsc",
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      [],
      "wbnb"
    )
  },
};
