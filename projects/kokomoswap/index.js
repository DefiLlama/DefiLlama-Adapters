const { getUniTVL } = require("../helper/unknownTokens.js");

const FACTORY = "0x971A5f6Ef792bA565cdF61C904982419AA77989f";

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      useDefaultCoreAssets: true,
      factory: FACTORY,
    }),
  },
};
