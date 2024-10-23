const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  kava: {
    tvl: uniV3GraphExport({
      graphURL: 'https://kava-graph-node.metavault.trade/subgraphs/name/kinetixfi/v3-subgraph',
      name: 'kinetixfi/kava-v3',
  })
  },
  base: {
    tvl: uniV3GraphExport({
      graphURL: 'https://api.studio.thegraph.com/query/55804/kinetixfi-base-v3/version/latest',
      name: 'kinetixfi/base-v3',
  })
  }
}
