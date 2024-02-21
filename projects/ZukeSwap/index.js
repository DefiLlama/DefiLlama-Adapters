const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  hallmarks: [
    [1680307200, "Rug Pull"]
  ],
  misrepresentedTokens: true,
  loop: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xc738bE6fE1A54d7B0F6e4C3262a46a002aC2508e',
    })
  }
}