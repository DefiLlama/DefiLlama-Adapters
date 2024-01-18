const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  chainx: {
    tvl: getUniTVL({ factory: '0x356FD03E73ce821d5F7dFea51d1cB336EeFd67b1', useDefaultCoreAssets: true }),
  }
}