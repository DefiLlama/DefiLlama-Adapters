const { getUniTVL } = require("./helper/unknownTokens")

module.exports = {
  misrepresentedTokens: true,
  fantom:{
    tvl: getUniTVL({
      factory: '0xb2435253c71fca27be41206eb2793e44e1df6b6d',
      useDefaultCoreAssets: true,
      chain: 'fantom',
    }),
  },
}