const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      fetchBalances: true,
      useDefaultCoreAssets: true,
      factory: '0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE',
    })
  }
};
