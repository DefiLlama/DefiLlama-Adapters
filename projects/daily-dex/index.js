const { uniTvlExport } = require('../helper/unknownTokens')

// Uniswap V2 factory on Daily Network mainnet (chain ID 824 / dly)
const FACTORY = '0x11c0d58d7D9B01e4B07013d3476F7b913803E875'

module.exports = uniTvlExport('dly', FACTORY)
module.exports.methodology =
  'TVL is the sum of tokens locked in Daily DEX Uniswap V2-style liquidity pools, discovered via the factory contract on Daily Network mainnet.'
