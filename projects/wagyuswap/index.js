const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  velas: {
    tvl: getUniTVL({
      factory: '0x69f3212344a38b35844cce4864c2af9c717f35e3', chain: 'velas', useDefaultCoreAssets: true,
    })
  },
}