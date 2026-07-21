const { getUniTVL } = require('../helper/unknownTokens')

// Diamond Finance — Uniswap V2 fork DEX on Bitkub Chain (chainId 96)
const factory = '0x6E906Dc4749642a456907deCB323A0065dC6F26E'

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the liquidity held across all Diamond Finance AMM pairs (a Uniswap V2 fork). For every pair that contains a whitelisted core asset (KKUB), the value of that core-asset side is counted and used to value the paired token.',
  bitkub: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
  },
}
