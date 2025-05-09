const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ogpu: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xEC03D5dc44143257F72B5a8e900bF2aAa0E702B0',
    })
  }
}