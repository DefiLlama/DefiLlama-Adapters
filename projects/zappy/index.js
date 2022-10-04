const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x4be5Bf2233a0fd2c7D1472487310503Ec8E857be) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  telos: {
    tvl: calculateUsdUniTvl(
      "0x4be5Bf2233a0fd2c7D1472487310503Ec8E857be",
      "telos",
      "0xd102ce6a4db07d247fcc28f366a623df0938ca9e",
      [
        "0x9a271e3748f59222f5581bae2540daa5806b3f77",
      ],
      "telos"
    ),
  },
};