const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      chain: 'canto',
      factory: '0x759e390D946249c63e0A1d8a810C5A577a591719',
      useDefaultCoreAssets: true,
      blacklist: [
        '0x7264610a66eca758a8ce95cf11ff5741e1fd0455',
      ]
    })
  }
}
