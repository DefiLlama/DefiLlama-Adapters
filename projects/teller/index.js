const { getConfig } = require('../helper/cache')

const EARN_ALL_API = 'https://earn-single-token-middleware-production.up.railway.app/tvl/all'

const tvl = async (api) => {
  const chainId = api.chainId
  const earnData = await getConfig('teller/earn-all', EARN_ALL_API)
  const tokens = Object.values(earnData).flat()
  tokens.filter(t => Number(t.chainId) === chainId).forEach(t => {
    api.addUSDValue(t.totalSupplied_usd)
  })
}

const borrowed = async (api) => {
  const chainId = api.chainId
  const earnData = await getConfig('teller/earn-all', EARN_ALL_API)
  const tokens = Object.values(earnData).flat()
  tokens.filter(t => Number(t.chainId) === chainId).forEach(t => {
    api.addUSDValue(t.totalBorrowed_usd)
  })
}

const CHAINS = ["ethereum", "base", "arbitrum", "hyperliquid", "polygon", "katana"]

CHAINS.forEach((chain) => {
  module.exports[chain] = {
    tvl,
    borrowed,
  }
})

module.exports.timetravel = false
module.exports.methodology = "TVL and borrowed values are fetched from the Teller earn-all API (totalSupplied_usd / totalBorrowed_usd), filtered per chain."
