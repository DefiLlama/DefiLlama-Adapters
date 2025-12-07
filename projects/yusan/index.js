const { getCache } = require('../helper/http')

const YUSAN_API = 'https://yusan.fi/metrics_json'
const ONESEC_API = 'https://1sec.to/api/balances'

const tokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  USDC: { decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { decimals: 6, coingeckoId: 'tether' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  ckDOGE: { decimals: 8, coingeckoId: 'dogecoin' },
}

const chainTokens = {
  icp: ['ICP'],
  bitcoin: ['ckBTC'],
  dogechain: ['ckDOGE'],
  ethereum: ['USDC', 'USDT'],
  arbitrum: ['USDC'],
  base: ['USDC'],
}

function parseBalance(str) {
  if (!str) return 0
  return Number(str.toString().replace(/_/g, ''))
}

function calcChainShare(supply, bridgeData, chain, symbol) {
  if (!bridgeData) return supply

  // Only sum chains where this token is listed in chainTokens
  const relevantChains = Object.entries(chainTokens)
    .filter(([, syms]) => syms.includes(symbol))
    .map(([c]) => c)

  const total = relevantChains
    .reduce((sum, c) => sum + parseBalance(bridgeData[c]), 0)

  if (total === 0) return supply

  const chainBalance = parseBalance(bridgeData[chain])
  return (supply * chainBalance) / total
}

function createTvl(chain) {
  return async (api) => {
    const [yusan, bridge] = await Promise.all([
      getCache(YUSAN_API),
      getCache(ONESEC_API),
    ])

    for (const symbol of chainTokens[chain]) {
      const { decimals, coingeckoId } = tokens[symbol]
      const supply = yusan.tokens[symbol]?.total_supply || 0
      if (supply <= 0) continue

      // Check if token is on multiple chains
      const chainsWithToken = Object.entries(chainTokens)
        .filter(([, syms]) => syms.includes(symbol))
        .map(([c]) => c)

      let amount = supply
      if (chainsWithToken.length > 1) {
        amount = calcChainShare(supply, bridge[symbol], chain, symbol)
      }

      if (amount > 0) {
        api.addCGToken(coingeckoId, amount / 10 ** decimals)
      }
    }
  }
}

async function borrowed(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { decimals, coingeckoId }] of Object.entries(tokens)) {
    const balance = data.tokens[symbol]?.total_borrow || 0
    if (balance > 0) {
      api.addCGToken(coingeckoId, balance / 10 ** decimals)
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is counted where value originates: ICP natively, BTC via ckBTC, DOGE via ckDOGE, and EVM stablecoins split by bridge proportions. Borrowed shows total outstanding loans.',
  icp: { tvl: createTvl('icp'), borrowed },
  bitcoin: { tvl: createTvl('bitcoin') },
  dogechain: { tvl: createTvl('dogechain') },
  ethereum: { tvl: createTvl('ethereum') },
  arbitrum: { tvl: createTvl('arbitrum') },
  base: { tvl: createTvl('base') },
}
