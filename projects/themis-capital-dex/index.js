const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  filecoin: {
    tvl: getUniTVL({
      factory: '0xe250A89d23F466c14B26BDF60a0DC3b54974FBE9', 
      useDefaultCoreAssets: true,
      fetchBalances: true,
    })
  },
};