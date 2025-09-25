const { uniV3GraphExport } = require("../helper/uniswapV3")

const config = {
  hyperliquid: 'https://api.goldsky.com/api/public/project_cmcxkn8h7pwwc01x30a5e6t39/subgraphs/cl-analytics-prod/v1.0.0/gn'
}

Object.keys(config).forEach(chain => {
  const graphURL = config[chain]
  module.exports[chain] = {
    tvl: uniV3GraphExport({ graphURL, name: 'kittenswap-algebra'+chain, blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb'] })
  }
})