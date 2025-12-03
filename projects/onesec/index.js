const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')

const API_URL = 'https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api/balances'

// All tokens on ICP chain (for ICP TVL - sum of all tokens)
const icpTokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  BOB: { decimals: 18, coingeckoId: 'bob-3' },
  CHAT: { decimals: 8, coingeckoId: 'openchat' },
  GLDT: { decimals: 8, coingeckoId: 'gold-dao' },
  USDC: { decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { decimals: 6, coingeckoId: 'tether' },
  cbBTC: { decimals: 8, coingeckoId: 'coinbase-wrapped-btc' },
}

// EVM-native tokens (only count on their native EVM chains)
const evmTokens = {
  ethereum: {
    USDC: { address: ADDRESSES.ethereum.USDC, decimals: 6 },
    USDT: { address: ADDRESSES.ethereum.USDT, decimals: 6 },
  },
  arbitrum: {
    USDC: { address: ADDRESSES.arbitrum.USDC_CIRCLE, decimals: 6 },
  },
  base: {
    USDC: { address: ADDRESSES.base.USDC, decimals: 6 },
    cbBTC: { address: ADDRESSES.base.cbBTC, decimals: 8 },
  },
}

// Parse underscore-separated number format (e.g., "154_526_569" -> 154526569)
function parseBalance(balanceStr) {
  if (!balanceStr) return 0
  return Number(balanceStr.toString().replace(/_/g, ''))
}

async function fetchData() {
  return get(API_URL)
}

async function icpTvl() {
  const data = await fetchData()
  const balances = {}

  for (const [token, config] of Object.entries(icpTokens)) {
    const balance = parseBalance(data[token]?.icp)
    if (balance > 0) {
      const key = `coingecko:${config.coingeckoId}`
      balances[key] = (balances[key] || 0) + balance / 10 ** config.decimals
    }
  }

  return balances
}

function createEvmTvl(chain) {
  return async (api) => {
    const data = await fetchData()
    const chainTokens = evmTokens[chain] || {}

    for (const [token, config] of Object.entries(chainTokens)) {
      const balance = parseBalance(data[token]?.[chain])
      if (balance > 0) {
        api.add(config.address, balance)
      }
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL counts all tokens on the ICP side of the bridge, plus EVM-native tokens locked on their respective EVM chains. EVM-native tokens are double counted as they appear on both ICP and their native chains.',
  icp: { tvl: icpTvl },
  ethereum: { tvl: createEvmTvl('ethereum') },
  arbitrum: { tvl: createEvmTvl('arbitrum') },
  base: { tvl: createEvmTvl('base') },
}
