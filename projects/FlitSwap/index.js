const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'op_bnb',
      useDefaultCoreAssets: true,
      factory: '0x243f0218EF4cB8FC922ddd6d44e2DdE5b95DCa89',
    })
  }
}