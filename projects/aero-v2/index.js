const sdk = require('@defillama/sdk')
const { uniTvlExport } = require('../helper/unknownTokens.js')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}
const stableTvl = uniTvlExport('chain', "0xaEd253F1aD84d99f2165256D701b2b481DD4CC16", { abis, hasStablePools: true, permitFailure: true, useDefaultCoreAssets: false, }).chain.tvl
const volatileTvl = uniTvlExport('chain', "0x9bc8b3F60D349d687Fb44A018967025E3741F9a5", { abis, permitFailure: true, }).chain.tvl
const migratedStableTvl = uniTvlExport('chain', "0x78589E876edcEbdce72ee3436ab3c9AD3a7cEF2D", { abis, hasStablePools: true, permitFailure: true, useDefaultCoreAssets: false, }).chain.tvl
const migratedVolatileTvl = uniTvlExport('chain', "0x8E6a9FCd1d638CC760Ffba397605Fe3355dE76D2", { abis, permitFailure: true, }).chain.tvl

const chains = ['optimism', 'base', 'arc', 'arbitrum', 'ethereum', 'ink', 'robinhood']

module.exports = {
  misrepresentedTokens: true,
}

chains.forEach(chain => {
  const tvls = [stableTvl, volatileTvl]
  if (chain !== 'arc') tvls.push(migratedStableTvl, migratedVolatileTvl)
  module.exports[chain] = { tvl: sdk.util.sumChainTvls(tvls) }
})
