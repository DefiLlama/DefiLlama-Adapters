const { uniTvlExport } = require("../helper/calculateUniTvl");
module.exports = {
  doublecounted: false,
  timetravel: true,
  start: 1682899200,
  era: {
    tvl: uniTvlExport("0x63E6fdAdb86Ea26f917496bEEEAEa4efb319229F", "era"),
  },
};
