const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x24dF3F586b3d313A98704478f83a4315ae5b19A9) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x24dF3F586b3d313A98704478f83a4315ae5b19A9",
      "bsc",
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      [
        "0x84Fd7CC4Cd689fC021eE3D00759B6D255269D538",
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "0x55d398326f99059fF775485246999027B3197955",
      ],
      "wbnb"
    ),
  },
};