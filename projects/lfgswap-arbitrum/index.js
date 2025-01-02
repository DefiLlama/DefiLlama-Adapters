const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xE5552e0318531F9Ec585c83bDc8956C08Bf74b71',
    })
  }
}