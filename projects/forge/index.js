const { uniV3GraphExport } = require('../helper/uniswapV3')
// evmos: { factory: '0xf544365e7065966f190155F629cE0182fC68Eaa2', fromBlock: 12367456, },

module.exports = {
  evmos: {
    tvl: uniV3GraphExport({ graphURL: 'https://api.orbitmarket.io/subgraphs/name/forge-trade/v3-subgraph'})
  }
}