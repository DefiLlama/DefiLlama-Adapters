const { uniV3Export, uniV3GraphExport } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  evmos: { factory: '0xf544365e7065966f190155F629cE0182fC68Eaa2', fromBlock: 12367456, },
})

// back-up
// module.exports = {
//   evmos: { tvl: uniV3GraphExport({ graphURL: 'https://subgraph.satsuma-prod.com/09c9cf3574cc/orbital-apes/v3-subgraph/api', name: 'forge-evmos' }) }
// }