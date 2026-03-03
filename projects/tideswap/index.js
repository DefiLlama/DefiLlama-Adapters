// TideSwap TVL Adapter
// Repo: DefiLlama/DefiLlama-Adapters
// Path: projects/tideswap/index.js
//
// TideSwap is a Uniswap V2 fork + meta-aggregator (0x + LI.FI) on Ink L2.
// TVL = liquidity locked in TideSwap's Uniswap V2 AMM pools.

const { uniTvlExport } = require('../helper/unknownTokens')

const FACTORY = '0x2ebE0528aDED9fA8d745B7C7082fb90d7C7B6Ec8'

module.exports = uniTvlExport('ink', FACTORY)
