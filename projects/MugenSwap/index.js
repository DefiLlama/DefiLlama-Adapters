const { getUniTVL } = require('../helper/unknownTokens')

const chain = 'arbitrum'

module.exports = {
  arbitrum: {
    tvl: getUniTVL({
      chain,
      useDefaultCoreAssets: true,
      factory: '0x1c758aF0688502e49140230F6b0EBd376d429be5',
    }),
  },
}
