const { uniTvlExport } = require("../helper/calculateUniTvl");
module.exports = {
  doublecounted: false,
  timetravel: true,
  start: 1678790700,
  arbitrum: {
    tvl: uniTvlExport("0x66020547Ce3c861dec7632495D86e1b93dA6542c", "arbitrum", true),
  },
};