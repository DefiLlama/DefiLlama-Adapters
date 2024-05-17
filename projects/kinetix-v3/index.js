const { uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = {
  kava: {
    tvl: uniV3GraphExport({
      // // factory: '0x2dBB6254231C5569B6A4313c6C1F5Fe1340b35C2', 
      // // fromBlock: 6069472
      graphURL: 'https://kava-graph-node.metavault.trade/subgraphs/name/kinetixfi/v3-subgraph',
      name: 'kinetixfi/kava-v3',
  })
  }
}
