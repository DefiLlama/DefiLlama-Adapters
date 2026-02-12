const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0xC60940F182F7699522970517f6d753A560546937"
const WETH = "0x4200000000000000000000000000000000000006"

module.exports = {
  misrepresentedTokens: true,
  megaeth: {
    tvl: getUniTVL({
      factory: FACTORY, 
      useDefaultCoreAssets: true,
      coreAssets: [WETH],
    })
  }
}


