const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  methodology: `Uses factory(0x23c7FA9A9f81B322684F25b8079e22C37e00b46b) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  thundercore: {
    tvl: calculateUsdUniTvl(
      "0x23c7FA9A9f81B322684F25b8079e22C37e00b46b",
      "thundercore",
      "0x413cEFeA29F2d07B8F2acFA69d92466B9535f717",
      [""],
      "thunder-token"
    ),
  },
};
