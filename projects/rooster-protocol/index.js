const { uniV3GraphExport } = require("../helper/uniswapV3")

const config = {
  plume_mainnet: "https://api.goldsky.com/api/public/project_cmeix03obfpwk012m74ysbe8w/subgraphs/analytics/1.0.8/gn"
}

Object.keys(config).forEach(chain => {
  const graphURL = config[chain]
  module.exports[chain] = {
    tvl: uniV3GraphExport({
      graphURL,
      name: 'rooster' + chain,
      blacklistedTokens: []
    })
  }
})
