const sdk = require("@defillama/sdk");
const { pool2 } = require("./helper/pool2");
const transformPolygonAddress = (id) => `polygon:${id}`;

// Staking on Mainnet: uni-v2
const SAND_ETH_univ2 = "0x3dd49f67E9d5Bc4C5E6634b3F70BfD9dc1b6BD74";
const SAND_ETH_univ2_staking = "0xeae6fd7d8c1740f3f1b03e9a5c35793cd260b9a6";
// Staking on Polygon: uni-v2
const SAND_MATIC_quick = "0x369582d2010b6ed950b571f4101e3bb9b554876f";
const SAND_MATIC_quick_staking = "0x4ab071c42c28c4858c4bac171f06b13586b20f30";

module.exports = {
  polygon: {
    tvl: () => ({}),
    pool2: pool2(
      SAND_MATIC_quick_staking,
      SAND_MATIC_quick,
      "polygon",
      transformPolygonAddress
    ),
  },
  ethereum: {
    tvl: () => ({}),
    pool2: pool2(SAND_ETH_univ2_staking, SAND_ETH_univ2, "ethereum"),
  },
  methodology:
    "SAND LP on quickswap and uniswap-v2 can be staked as pool2 - only component of the Sandbox TVL at the moment",
};
