const { uniV3GraphExport } = require("../helper/uniswapV3");


module.exports = {
  tac: {
    tvl: uniV3GraphExport({ graphURL: 'https://api.goldsky.com/api/public/project_cltyhthusbmxp01s95k9l8a1u/subgraphs/cl-analytics-tac/v1.0.1/gn', name: 'snap-tac' }),
  }
}