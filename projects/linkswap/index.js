const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  zklink: {
    tvl: getUniTVL({
      factory: "0x87929083ac2215cF3CE4936857D314aF6687C978",
      useDefaultCoreAssets: true,
    }),
  },
};
