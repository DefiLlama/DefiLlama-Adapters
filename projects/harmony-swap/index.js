const { uniV3Export, uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = {
  harmony: { tvl: uniV3GraphExport({ graphURL: 'GVkp9F6TzzC5hY4g18Ukzb6gGcYDfQrpMpcj867jsenJ', name: 'harmony-swap' }) }
}