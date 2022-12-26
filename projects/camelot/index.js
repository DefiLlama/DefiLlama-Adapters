const { uniTvlExport } = require("../helper/calculateUniTvl");
module.exports = {
  doublecounted: false,
  timetravel: true,
  start: 1669075200,
  arbitrum: {
    tvl: uniTvlExport("0x6EcCab422D763aC031210895C81787E87B43A652", "arbitrum"),
  },
};