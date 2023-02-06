const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  velas: {
    tvl: getUniTVL({
      factory: '0x69f3212344a38b35844cce4864c2af9c717f35e3', chain: 'velas', useDefaultCoreAssets: true,
      blacklist: ['0xcd7509b76281223f5b7d3ad5d47f8d7aa5c2b9bf'],
    })
  },
}