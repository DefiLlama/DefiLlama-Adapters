const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  doublecounted: false,
  timetravel: true,
  start: 1667689200,
  arbitrum: {
    tvl: uniTvlExport("0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218", "arbitrum"),
  },
  hallmarks: [[1668038400, "Emissions started"]],
};
