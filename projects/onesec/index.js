const ADDRESSES = require('../helper/coreAssets.json')
const { getCache } = require('../helper/http')

const API_URL = 'https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api/balances'

// ICP-native tokens (custodied on ICP)
const icpTokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  BOB: { decimals: 8, coingeckoId: 'bob-3' },
  CHAT: { decimals: 8, coingeckoId: 'openchat' },
  GLDT: { decimals: 8, coingeckoId: 'gold-dao' },
}

// EVM-native tokens (custodied on respective EVM chains)
const evmTokens = {
  ethereum: {
    USDC: ADDRESSES.ethereum.USDC,
    USDT: ADDRESSES.ethereum.USDT,
  },
  arbitrum: {
    USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
  },
  base: {
    USDC: ADDRESSES.base.USDC,
    cbBTC: ADDRESSES.base.cbBTC,
  },
}

function parseBalance(balanceStr) {
  if (!balanceStr) return 0
  return Number(balanceStr.toString().replace(/_/g, ''))
}

async function icpTvl() {
  const data = await getCache(API_URL)
  const balances = {}

  for (const [token, { decimals, coingeckoId }] of Object.entries(icpTokens)) {
    const balance = parseBalance(data[token]?.icp)
    if (balance > 0) {
      balances[`coingecko:${coingeckoId}`] = balance / 10 ** decimals
    }
  }

  return balances
}

function createEvmTvl(chain) {
  return async (api) => {
    const data = await getCache(API_URL)

    for (const [token, address] of Object.entries(evmTokens[chain])) {
      const balance = parseBalance(data[token]?.[chain])
      if (balance > 0) {
        api.add(address, balance)
      }
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts tokens where collateral is custodied: ICP-native tokens on ICP chain, and EVM-native tokens locked on their respective EVM chains.',
  icp: { tvl: icpTvl },
  ethereum: { tvl: createEvmTvl('ethereum') },
  arbitrum: { tvl: createEvmTvl('arbitrum') },
  base: { tvl: createEvmTvl('base') },
}
