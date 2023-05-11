const { uniTvlExport } = require("../helper/calculateUniTvl");

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: uniTvlExport("0x7096Cebc52012e2611a1E88c45bC54ee2A88dcB4", "era"),
  },
  methodology: "Counts liquidity in pools",
};