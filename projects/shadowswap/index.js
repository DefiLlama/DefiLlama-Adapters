const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      chain: 'core',
      useDefaultCoreAssets: true,
      factory: '0x326Ee96748E7DcC04BE1Ef8f4E4F6bdd54048932',
    })
  }
}