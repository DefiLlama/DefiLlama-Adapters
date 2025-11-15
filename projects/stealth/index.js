const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x6ff746cf0ab3f0a3643f4bf9cd900837f8c6f7b5'

module.exports = {
  methodology: `AVAX, USDC, USDT allocated in LP`,
  misrepresentedTokens: true,
  metis:{
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
  }
}
