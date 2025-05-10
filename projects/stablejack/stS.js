const { sumTokensExport } = require("../helper/unwrapLPs");

const stS = "0xe5da20f15420ad15de0fa650600afc998bbe3955";
const stS_HOLDER = "0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155";

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      owner: stS_HOLDER,
      tokens: [stS],
    }),
  },
};
