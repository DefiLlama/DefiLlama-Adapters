const { getCache } = require('../helper/http')

const YUSAN_API = 'https://52mp3-qiaaa-aaaar-qbzja-cai.icp0.io/metrics_json'
const ONESEC_API = 'https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api/balances'

const tokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  USDC: { decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { decimals: 6, coingeckoId: 'tether' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  ckDOGE: { decimals: 8, coingeckoId: 'dogecoin' },
}

const evmChainTokens = {
  ethereum: ['USDC', 'USDT'],
  arbitrum: ['USDC'],
  base: ['USDC'],
}

function parseBalance(str) {
  if (!str) return 0
  return Number(str.toString().replace(/_/g, ''))
}

function calcChainShare(yusanSupply, bridgeData, chain) {
  const evmTotal =
    parseBalance(bridgeData?.ethereum) +
    parseBalance(bridgeData?.arbitrum) +
    parseBalance(bridgeData?.base)

  if (evmTotal === 0) return 0

  const chainBalance = parseBalance(bridgeData?.[chain])
  return (yusanSupply * chainBalance) / evmTotal
}

async function icpTvl(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { decimals, coingeckoId }] of Object.entries(tokens)) {
    const balance = data.tokens[symbol]?.total_supply || 0
    if (balance > 0) {
      api.addCGToken(coingeckoId, balance / 10 ** decimals)
    }
  }
}

async function icpBorrowed(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { decimals, coingeckoId }] of Object.entries(tokens)) {
    const balance = data.tokens[symbol]?.total_borrow || 0
    if (balance > 0) {
      api.addCGToken(coingeckoId, balance / 10 ** decimals)
    }
  }
}

function createNativeChainTvl(token) {
  return async (api) => {
    const data = await getCache(YUSAN_API)
    const { decimals, coingeckoId } = tokens[token]
    const balance = data.tokens[token]?.total_supply || 0
    if (balance > 0) {
      api.addCGToken(coingeckoId, balance / 10 ** decimals)
    }
  }
}

function createEvmTvl(chain) {
  return async (api) => {
    const [yusan, bridge] = await Promise.all([
      getCache(YUSAN_API),
      getCache(ONESEC_API),
    ])

    for (const symbol of evmChainTokens[chain]) {
      const { decimals, coingeckoId } = tokens[symbol]
      const supply = yusan.tokens[symbol]?.total_supply || 0
      const amount = calcChainShare(supply, bridge[symbol], chain)
      if (amount > 0) {
        api.addCGToken(coingeckoId, amount / 10 ** decimals)
      }
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    'TVL is the total supply deposited in Yusan lending markets. Borrowed shows total outstanding loans.',
  icp: { tvl: icpTvl, borrowed: icpBorrowed },
  bitcoin: { tvl: createNativeChainTvl('ckBTC') },
  dogechain: { tvl: createNativeChainTvl('ckDOGE') },
  ethereum: { tvl: createEvmTvl('ethereum') },
  arbitrum: { tvl: createEvmTvl('arbitrum') },
  base: { tvl: createEvmTvl('base') },
}
