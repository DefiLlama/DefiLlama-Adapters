const { sumTokensExport } = require('./helper/unwrapLPs')

const owner = '0xff8C479134A18918059493243943150776cF8CF2' // vault address
const tokens = [
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0xff8C479134A18918059493243943150776cF8CF2', // RENQ
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
]

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner, tokens })
  }
}
