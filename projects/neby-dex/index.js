const { uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = {
  sapphire: {
      tvl: uniV3GraphExport({
          name: 'Neby Dex', graphURL: 'https://api.goldsky.com/api/public/project_clzi4lu67khgw01072ibvekvt/subgraphs/neby-dex-sapphire-mainnet/1.0.0/gn'
      }),
  }
}
