const { get } = require('../helper/http')
const { addCGToken } = require('../helper/tokenMapping')

const GLDT_METRICS_URL = 'https://6c7su-kiaaa-aaaar-qaira-cai.raw.icp0.io/metrics'

async function tvl(api) {
  const metrics = await get(GLDT_METRICS_URL, { responseType: 'text' })
  const match = metrics.match(/ledger_total_supply\s+(\d+)/)
  if (!match) throw new Error('Could not parse GLDT total supply')
  const totalSupply = Number(match[1]) / 1e8  // 8 decimals
  api.addCGToken('gold-token', totalSupply)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL counts total GLDT supply (each GLDT = 0.01g of physical gold) priced via CoinGecko",
  icp: {
    tvl,
  },
}
