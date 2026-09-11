const axios = require('axios')
const sdk = require('@defillama/sdk')
const { getConfig } = require('../projects/helper/cache')

// We pull the owner set from Bybit's monthly PoR CSV, one row per "<COIN>-<Chain>":
// Coin,Height,Amount,Address  (the Address column is space-separated: <Address1> <Address2> ...)
const BASE = 'https://api2.bybit.com/common-static/por'

// Bybit PoR chain suffix -> chain slug
const CHAIN_MAP = {
  Ethereum: 'ethereum', BSC: 'bsc', Arbitrum: 'arbitrum', ARBINOVA: 'arbitrum_nova',
  AVAXC: 'avax', Optimism: 'optimism', Polygon: 'polygon', Mantle: 'mantle', BASE: 'base', 
  Solana: 'solana', Aptos: 'aptos', SUI: 'sui', TON: 'ton', ZKSync: 'era', ZKSyncEra: 'era',
  TRX: 'tron', Tron: 'tron', XRP: 'ripple', Scroll: 'scroll', TAIKO: 'taiko', LINEA: 'linea',
  Manta: 'manta', Litecoin: 'litecoin', Dogecoin: 'doge', Cosmos: 'cosmos', Celo: 'celo',
  Polkadot: 'polkadot', KLAY: 'klaytn', KAVAEVM: 'kava', EOS: 'eos', Dydx: 'dydx', Sonic: 'sonic',
  HyperEVM: 'hyperliquid', PLASMA: 'plasma', MONAD: 'monad', Cardano: 'cardano', Starknet: 'starknet',
}

async function fetchLatestCsv() {
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const ym = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    try {
      const { data } = await axios.get(`${BASE}/bybit_por_${ym}.csv`)
      // Require the header so a 200 that isn't the PoR CSV (error/HTML page)
      // fetches the previous month instead of using an empty owner set
      if (typeof data === 'string' && data.startsWith('Coin,')) { sdk.log(`bybit: using PoR ${ym}`); return data }
    } catch (e) { /* may not be published yet, try previous month */ }
  }
  throw new Error('bybit: no PoR CSV found in the last 3 months')
}

// Bybit's CSV occasionally contains invalid EVM addresses, e.g. odd length hex
function isValidAddress(a) {
  if (!a.startsWith('0x')) return true
  const hex = a.slice(2)
  return hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)
}

function parseOwnersByChain(csv) {
  const byChain = {}
  const unmapped = new Set()
  const lines = csv.trim().split(/\r?\n/)
  for (let i = 1; i < lines.length; i++) { // skip header
    const parts = lines[i].split(',')
    if (parts.length < 4) continue
    const coin = parts[0]
    if (coin.includes('(ALL)')) continue // aggregate rows have no address
    const addrs = parts.slice(3).join(',').trim() // addresses are space-separated within one column
    if (!addrs) continue
    const slug = CHAIN_MAP[coin.split('-').pop()] // chain is the suffix after the last '-'
    if (!slug) { unmapped.add(coin.split('-').pop()); continue }
    const set = byChain[slug] || (byChain[slug] = new Set())
    for (const a of addrs.split(/\s+/)) if (a && isValidAddress(a)) set.add(a)
  }
  if (unmapped.size) sdk.log('bybit: skipped unmapped PoR chains:', [...unmapped].join(', '))
  return Object.fromEntries(Object.entries(byChain).map(([slug, set]) => [slug, [...set]]))
}

const getOwners = () => getConfig('bybit-por', undefined, { fetcher: async () => parseOwnersByChain(await fetchLatestCsv()) })

// chains Bybit doesn't list in its PoR CSV but still hold balances
const STATIC_OWNERS = {
  cardano: ['addr1v8mn6dmk7tf9u26kr09a05lmvc9j4k9d940a88ta3hdczqgyt7whl'],
  fantom: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40'],
  starknet: ['0x076601136372fcdbbd914eea797082f7504f828e122288ad45748b0c8b0c9696'],
}

module.exports = { bitcoin: 'bybit' }
for (const slug of new Set(Object.values(CHAIN_MAP)))
  module.exports[slug] = { owners: async () => (await getOwners())[slug] || [] }
for (const [slug, owners] of Object.entries(STATIC_OWNERS))
  module.exports[slug] = { owners }
