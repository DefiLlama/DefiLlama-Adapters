const { uniTvlExport } = require("../helper/calculateUniTvl");
module.exports = {
  doublecounted: false,
  timetravel: true,
  start: 1692842880,
  base: {
    tvl: uniTvlExport("0x55b3409335B81E7A8B7C085Bbb4047DDc23f7257", "base", true),
  },
};