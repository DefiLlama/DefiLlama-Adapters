const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'loop',
      useDefaultCoreAssets: true,
      factory: '0xc738bE6fE1A54d7B0F6e4C3262a46a002aC2508e',
    })
  }
}