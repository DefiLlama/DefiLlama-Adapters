const { uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = {
    planq: { tvl: uniV3GraphExport({ graphURL: 'https://subgraph.planq.finance/subgraphs/name/ianlapham/uniswap-v3', name: 'physica-v3'}),}
}
