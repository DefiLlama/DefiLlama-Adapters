const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0xf5833b5f514613beB33b4259a08aa64326E95c53"

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
    }),
  }
}
