const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address on tomochain (0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  tomochain: {
    tvl: calculateUsdUniTvl(
      "0x28c79368257CD71A122409330ad2bEBA7277a396",
      "tomochain",
      "0xB1f66997A5760428D3a87D68b90BfE0aE64121cC",
      [
        "0x7262fa193e9590b2e075c3c16170f3f2f32f5c74",
        "0x381B31409e4D220919B2cFF012ED94d70135A59e",
        "0x2EAA73Bd0db20c64f53fEbeA7b5F5E5Bccc7fb8b",
      ],
      "tomochain"
    ),
  },
  ethereum: {
    tvl: calculateUsdUniTvl(
      "0x0388C1E0f210AbAe597B7DE712B9510C6C36C857",
      "ethereum",
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      [
        "0xb1f66997a5760428d3a87d68b90bfe0ae64121cc",
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "0x05d3606d5c81eb9b7b18530995ec9b29da05faba",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
      ],
      "ethereum"
    ),
  },
  tvl: async () => ({}),
};
