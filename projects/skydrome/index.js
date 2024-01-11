const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const V1_FACTORY = '0x2516212168034b18a0155FfbE59f2f0063fFfBD9'
const V2_FACTORY = '0x74B8738862E4814C6E6D6e0202F8386685ca7B9D'

const tvl = sdk.util.sumChainTvls([V1_FACTORY, V2_FACTORY].map((factory) => getUniTVL({ factory, useDefaultCoreAssets: true, hasStablePools: true, })))

module.exports = {
  misrepresentedTokens: true,
  scroll: { tvl },
}
