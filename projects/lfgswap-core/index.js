const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xA1ADD165AED06D26fC1110b153ae17a5A5ae389e',
    })
  }
}