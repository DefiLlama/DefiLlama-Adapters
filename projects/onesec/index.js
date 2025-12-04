const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getCache } = require('../helper/http')

const API_URL = 'https://5okwm-giaaa-aaaar-qbn6a-cai.raw.icp0.io/api/balances'
const LOCKER = '0x70AE25592209B57F62b3a3e832ab356228a2192C'

const icpTokens = {
  ICP: { decimals: 8, coingeckoId: 'internet-computer' },
  ckBTC: { decimals: 8, coingeckoId: 'bitcoin' },
  BOB: { decimals: 8, coingeckoId: 'bob-3' },
  CHAT: { decimals: 8, coingeckoId: 'openchat' },
  GLDT: { decimals: 8, coingeckoId: 'gold-dao' },
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

module.exports = {
  timetravel: false,
  methodology: 'TVL counts tokens where collateral is custodied: ICP-native tokens on ICP chain, and EVM-native tokens locked in the locker contract on their respective EVM chains.',
  icp: { tvl: icpTvl },
  ethereum: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.cbBTC, ADDRESSES.ethereum.USDT] })
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.ethereum.cbBTC] })
  },
  base: {
    tvl: sumTokensExport({ owner: LOCKER, tokens: [ADDRESSES.base.USDC, ADDRESSES.base.cbBTC] })
  },
}
