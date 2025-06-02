const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  era: {
    tvl: getUniTVL({ factory: "0xb618Db8D97db96f31C1eb0Fb99D9b5b372c2BdD3", useDefaultCoreAssets: true,})
  },
};