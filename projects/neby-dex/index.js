const { uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = {
  sapphire: {
      tvl: uniV3GraphExport({
          name: 'Neby Dex', graphURL: 'https://graph.api.neby.exchange/dex'
      }),
  }
}
