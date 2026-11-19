const sdk = require('@defillama/sdk')
const { get } = require('../http')

// SASEUL mainnet public nodes (defaults published by the official saseul-js SDK).
// Balance queries do not need a signature: GET /request?request=<json>
const NODES = [
  'https://main.saseul.net',
  'https://sub.saseul.net',
  'https://aroma.saseul.net',
  'https://blanc.saseul.net',
]
const DECIMALS = 18
const SL = 'coingecko:saseul'

async function request(type, params = {}) {
  const query = encodeURIComponent(JSON.stringify({ type, ...params }))
  let lastError
  for (const node of NODES) {
    try {
      const res = await get(`${node}/request?request=${query}`)
      if (res?.code !== 200) throw new Error(`SASEUL node ${node}: ${res?.msg ?? 'bad response'}`)
      return res.data
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

// Native SL balance of an address, in whole coins
async function getBalance(address) {
  const data = await request('GetBalance', { address })
  const raw = data?.balance ?? '0'   // 18-decimal integer string, null for an unused address
  return Number(BigInt(raw) * 1000000n / (10n ** BigInt(DECIMALS))) / 1e6
}

async function sumTokens({ balances = {}, owners = [] }) {
  for (const owner of owners) {
    const amount = await getBalance(owner)
    sdk.util.sumSingleBalance(balances, SL, amount)
  }
  return balances
}

module.exports = {
  sumTokens,
  getBalance,
}
