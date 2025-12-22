const { getCache } = require('../helper/http')

const YUSAN_API = 'https://yusan.fi/metrics_json'
const ONESEC_API = 'https://1sec.to/api/balances'

const tokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  USDC: { decimals: 8, coingeckoId: 'usd-coin' },
  USDT: { decimals: 8, coingeckoId: 'tether' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  ckDOGE: { decimals: 8, coingeckoId: 'dogecoin' },
}

const chainTokens = {
  icp: ['ICP'],
  bitcoin: ['ckBTC'],
  doge: ['ckDOGE'],
  ethereum: ['USDC', 'USDT'],
  arbitrum: ['USDC'],
  base: ['USDC'],
}

function parseBalance(str) {
  if (!str) return 0
  return Number(str.toString().replace(/_/g, ''))
}

function calcChainShare(supply, bridgeData, chain, relevantChains) {
  if (!bridgeData) return supply

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
      const borrow = yusan.tokens[symbol]?.total_borrow || 0
      const available = supply - borrow
      if (available <= 0) continue

      // Check if token is on multiple chains
      const chainsWithToken = Object.entries(chainTokens)
        .filter(([, syms]) => syms.includes(symbol))
        .map(([c]) => c)

      let amount = available
      if (chainsWithToken.length > 1) {
        amount = calcChainShare(available, bridge[symbol], chain, chainsWithToken)
      }

      if (amount > 0) {
        api.addCGToken(coingeckoId, amount / 10 ** decimals)
      }
    }

    // Add liquidation pool balances to ICP chain (where the pool resides)
    if (chain === 'icp' && yusan.liquidation_pool) {
      for (const [symbol, balance] of Object.entries(yusan.liquidation_pool)) {
        if (!tokens[symbol] || balance <= 0) continue
        const { decimals, coingeckoId } = tokens[symbol]
        api.addCGToken(coingeckoId, balance / 10 ** decimals)
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
    'Cross-chain lending protocol. Deposits attributed to origin chains.',
  icp: { tvl: createTvl('icp'), borrowed },
  bitcoin: { tvl: createTvl('bitcoin') },
  doge: { tvl: createTvl('doge') },
  ethereum: { tvl: createTvl('ethereum') },
  arbitrum: { tvl: createTvl('arbitrum') },
  base: { tvl: createTvl('base') },
}
