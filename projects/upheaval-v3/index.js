const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  hyperliquid: {
    tvl: uniV3GraphExport({ graphURL: 'https://api.upheaval.fi/subgraphs/name/upheaval/exchange-v3-fixed', name: 'upheaval' }),
  }
}