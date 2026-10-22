const sdk = require('@defillama/sdk')
const { uniTvlExport } = require('../helper/unknownTokens.js')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}
const stableTvl = uniTvlExport('chain', "0x78589E876edcEbdce72ee3436ab3c9AD3a7cEF2D", { abis, hasStablePools: true, permitFailure: true, useDefaultCoreAssets: false, }).chain.tvl
const volatileTvl = uniTvlExport('chain', "0x8E6a9FCd1d638CC760Ffba397605Fe3355dE76D2", { abis, permitFailure: true, }).chain.tvl

const chains = ['optimism', 'base', 'arc', 'arbitrum', 'ethereum', 'ink', 'robinhood']

module.exports = {
  misrepresentedTokens: true,
}

chains.forEach(chain => {
  module.exports[chain] = { tvl: sdk.util.sumChainTvls([stableTvl, volatileTvl]) }
})
