const { getUniTVL, } = require('../helper/unknownTokens')

const chain = 'dogechain'


module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain, useDefaultCoreAssets: true,
      factory: '0x643038270f316552A4FBfd5c100489982d076f86',
    })
  }
}
