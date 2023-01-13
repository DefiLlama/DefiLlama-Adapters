const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  milkomeda_a1: {
    tvl: getUniTVL({
      factory: '0x65be76efd12e7932bcd99acfefb8d531ec4f7e0d', chain: 'milkomeda_a1', useDefaultCoreAssets: true,
    })
  },
};