const { get } = require('../helper/http')

const API_BASE = process.env.ANCHORED_API_BASE || 'https://rwa-api.anchored.finance/rwa/api/v2/defillama'

async function getValue(chain) {
  const response = await get(`${API_BASE}/value?chain=${chain}`)
  if (!response || response.code !== 200 || !response.data)
    throw new Error(`Anchored value endpoint failed for ${chain}`)
  return response.data
}

async function tvl(api) {
  const data = await getValue(api.chain)
  const chainValue = data.valueByChain?.[api.chain] ?? data.value
  api.addUSDValue(Number(chainValue || 0))
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is reported as tokenized stock supply multiplied by cached underlying equity prices plus cashier balances, sourced from Anchored public DeFiLlama endpoint.',
  ethereum: {
    tvl,
  },
  monad: {
    tvl,
  },
}
