const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({factory: "0xAe9F4488CC751637b18070c5453a3b7Acc137a3b", useDefaultCoreAssets: true, })
  },
}
