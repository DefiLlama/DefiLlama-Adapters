const { getCache } = require('../helper/http')

const YUSAN_API = 'https://yusan.fi/metrics_json'

const tokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  USDC: { decimals: 8, coingeckoId: 'usd-coin' },
  USDT: { decimals: 8, coingeckoId: 'tether' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  ckDOGE: { decimals: 8, coingeckoId: 'dogecoin' },
}

async function tvl(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { decimals, coingeckoId }] of Object.entries(tokens)) {
    const supply = data.tokens[symbol]?.total_supply || 0
    const borrow = data.tokens[symbol]?.total_borrow || 0
    const available = supply - borrow
    if (available > 0) api.addCGToken(coingeckoId, available / 10 ** decimals)
  }
}

async function borrowed(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { decimals, coingeckoId }] of Object.entries(tokens)) {
    const balance = data.tokens[symbol]?.total_borrow || 0
    if (balance > 0) api.addCGToken(coingeckoId, balance / 10 ** decimals)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is supplied assets minus borrowed assets in Yusan lending markets.',
  icp: { tvl, borrowed },
}
