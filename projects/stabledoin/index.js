const { getUniTVL } = require('../helper/unknownTokens')

const factory = "0x7bbAB21475d99C09a92fc4B93Fa2DDa987DbA17c"

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',factory , useDefaultCoreAssets: true,
    }),
  }
}
