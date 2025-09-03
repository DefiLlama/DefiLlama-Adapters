const { uniV3GraphExport } = require("../helper/uniswapV3")

const config = {
  polygon: 'GRjn45pSybSFfpht8CgZdJ2XDGexcVcWEfMgKjwo7WwA'
}

Object.keys(config).forEach(chain => {
  const graphURL = config[chain]
  module.exports[chain] = {
    tvl: uniV3GraphExport({ graphURL, name: 'w-dex' + chain })
  }
})