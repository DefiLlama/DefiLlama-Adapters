const { getUniTVL, } = require('../helper/unknownTokens')
const chain = 'bitgert'
const factory = '0x9E6d21E759A7A288b80eef94E4737D313D31c13f'

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: getUniTVL({ chain, factory, useDefaultCoreAssets: true, version: '2', }),
  },
};
