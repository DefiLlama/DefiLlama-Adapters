const { uniTvlExport } = require('../helper/unknownTokens.js')

// Raphael Exchange - Aerodrome/Velodrome-v2 (Solidly) fork on Robinhood Chain
// https://docs.raphael.exchange/developers/contract-deployments
const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}

const tvl = uniTvlExport('robinhood', '0x1A6745F84099Fa7E84D1f3B34c23482865194bd1', { abis, hasStablePools: true, permitFailure: true, }).robinhood.tvl

module.exports = {
  misrepresentedTokens: true,
  robinhood: { tvl },
}
