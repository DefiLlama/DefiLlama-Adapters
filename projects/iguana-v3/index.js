const { uniV3GraphExport } = require("../helper/uniswapV3");


module.exports.etlk = { tvl: uniV3GraphExport({ name: 'iguana-etlk', graphURL: 'https://api.studio.thegraph.com/query/86688/exchange-v3-etherlink/version/latest' }) }