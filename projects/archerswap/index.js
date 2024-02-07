const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xe0b8838e8d73ff1CA193E8cc2bC0Ebf7Cf86F620',
    })
  }
}