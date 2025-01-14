const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  hela: {
    tvl: uniV3GraphExport({ graphURL: 'https://subgraph.snapresearch.xyz/subgraphs/name/cytoswap-mainnet', name: 'cytoswap-hela' }),
  }
}