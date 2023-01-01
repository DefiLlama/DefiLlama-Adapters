const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  ethereum: {
    tvl: uniTvlExport("0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6", "ethereum"),
  },
};
