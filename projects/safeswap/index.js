const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  polygon: {
    tvl: calculateUsdUniTvl(
      "0x5be44d6C5634161CdaDcC2bc35389325aa493e83",
      "polygon",
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      [
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
        "0x7e7ff932fab08a0af569f93ce65e7b8b23698ad8",
        "0xd0cfd20e8bbdb7621b705a4fd61de2e80c2cd02f",
        "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
      ],
      "wmatic"
    ),
  },
  ethereum: {
    tvl: calculateUsdUniTvl(
      "0xB919aD419688F7C274f11F180112514941a910CB",
      "ethereum",
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      [
        "0xf4cd3d3fda8d7fd6c5a500203e38640a70bf9577",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0x84cffa78b2fbbeec8c37391d2b12a04d2030845e",
        "0x560cc7de81b2a594f6518713cbe122bcf297a6e8",
      ],
      "weth"
    ),
  },
};