const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  linea: '0xecD30C099c222AbffDaf3E2A3d2455FC8e8c739E',
  polygon_zkevm: '0x51a0d4b81400581d8722627dafcd0c1ff9357d1d',
  blast: '0x51a0d4b81400581d8722627dafcd0c1ff9357d1d',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], fetchBalances: true, useDefaultCoreAssets: true })
  }
})
