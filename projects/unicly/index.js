const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  ethereum:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xbacc776b231c571a7e6ab7bc2c8a099e07153377',
    }),
  },
}
