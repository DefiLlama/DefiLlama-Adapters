const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum_nova: {
    tvl: getUniTVL({
      chain: 'arbitrum_nova',
      useDefaultCoreAssets: true,
      factory: '0xF9901551B4fDb1FE8d5617B5deB6074Bb8E1F6FB',
    })
  }
};