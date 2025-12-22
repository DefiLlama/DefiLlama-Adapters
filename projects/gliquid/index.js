/* const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  hyperliquid: {
    factory: "0x10253594A832f967994b44f33411940533302ACb",
    fromBlock: 4347220,
    isAlgebra: true,
  },
});
 */

const { uniV3GraphExport } = require("../helper/uniswapV3")


const config = {
  hyperliquid: 'https://api.goldsky.com/api/public/project_cmb20ryy424yb01wy7zwd7xd1/subgraphs/analytics/v1.0.0/gn'
}

Object.keys(config).forEach(chain => {
  const graphURL = config[chain]
  module.exports[chain] = {
    tvl: uniV3GraphExport({ graphURL, name: 'gliquid-'+chain})
  }
})