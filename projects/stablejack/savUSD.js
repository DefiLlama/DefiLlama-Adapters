const { sumTokensExport } = require("../helper/unwrapLPs");

const savUSD = "0x06d47F3fb376649c3A9Dafe069B3D6E35572219E";
const savUSD_HOLDER = "0xC37914DacF56418A385a4883512Be8b8279c94C5";

module.exports = {
  avalanche: {
    tvl: sumTokensExport({
      owner: savUSD_HOLDER,
      tokens: [savUSD],
    }),
  },
};
