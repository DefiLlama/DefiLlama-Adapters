const { getUniTVL } = require('../helper/unknownTokens')

const chain = 'arbitrum'

module.exports = {
  arbitrum: {
    tvl: getUniTVL({
      chain,
      useDefaultCoreAssets: true,
      factory: '0x617Dee16B86534a5d792A4d7A62FB491B544111E',
    }),
  },
}
