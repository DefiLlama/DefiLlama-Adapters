const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
  methodology:
    "Factory address on tomochain (0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  tomochain: {
    tvl: getUniTVL({ factory: '0x28c79368257CD71A122409330ad2bEBA7277a396', useDefaultCoreAssets: true }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: '0x0388C1E0f210AbAe597B7DE712B9510C6C36C857', useDefaultCoreAssets: true }),
  },
}
