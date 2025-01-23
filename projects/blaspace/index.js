const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({
      factory: '0xCAb98fEd113d403EbD9E294D80Bf92E3f19ddD57',
      useDefaultCoreAssets: true,
    })
  },
};
