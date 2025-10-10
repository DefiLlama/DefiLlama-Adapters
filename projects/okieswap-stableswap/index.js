const { uniV3GraphExport } = require('../helper/uniswapV3')


module.exports = {
  xlayer: {
    tvl: uniV3GraphExport({ graphURL: 'https://subgraph.okiedokie.fun/subgraphs/name/stableswap', name: 'okie-stable-xlayer', poolName: 'pairs' }),
  }
}