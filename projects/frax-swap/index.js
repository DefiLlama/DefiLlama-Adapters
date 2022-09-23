const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      chain: 'ethereum',
      factory: '0xb076b06f669e682609fb4a8c6646d2619717be4b',
      useDefaultCoreAssets: true,
    }),
  },
  moonbeam: {
    tvl: getUniTVL({
      chain: 'moonbeam',
      factory: '0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E',
      useDefaultCoreAssets: true,
    }),
  },
};