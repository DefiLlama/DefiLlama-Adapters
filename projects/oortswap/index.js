const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: calculateUsdUniTvl(
      "0xac15fe2C74bD635EfAF687F302633C7e5EbfF973",
      "rei",
      "0x2545af3d8b11e295bb7aedd5826021ab54f71630",
      [
        "0x3d1bbd0ec9af25e8f12383d9f6a6bbfa6dfef06f",
      ],
      "rei-network"
    ),
  },
}; // node test.js projects/oortswap/index.js