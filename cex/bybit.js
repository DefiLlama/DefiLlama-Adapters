const axios = require('axios')
const sdk = require('@defillama/sdk')
const { getConfig } = require('../projects/helper/cache')
const { address: tonAddress } = require('../projects/helper/utils/ton')

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
  Polkadot: 'polkadot', KLAY: 'klaytn', KAIA: 'klaytn', KAVAEVM: 'kava', EOS: 'eos', Dydx: 'dydx', Sonic: 'sonic',
  HyperEVM: 'hyperliquid', PLASMA: 'plasma', MONAD: 'monad', Cardano: 'cardano', Starknet: 'starknet',
  SEIEVM: 'sei', HBAR: 'hedera', STABLE: 'stable', Bera: 'berachain',
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

// Bybit's CSV occasionally contains invalid addresses, e.g. odd length hex or a truncated TON address
// (one bad TON address makes toncenter reject the whole batched accountStates request with a 422)
function isValidAddress(a, slug) {
  if (slug === 'ton') {
    try { tonAddress(a); return true } catch (e) { return false }
  }
  if (!a.startsWith('0x')) return true
  const hex = a.slice(2)
  return hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)
}

// the CSV lists some TON wallets in both bounceable (EQ..) and non-bounceable (UQ..) form, normalize so they dedupe
function normalizeAddress(a, slug) {
  if (slug === 'ton') return tonAddress(a).toString()
  return a
}

function parseOwnersByChain(csv) {
  const byChain = {}
  const unmapped = new Set()
  const invalid = []
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
    for (const a of addrs.split(/\s+/)) {
      if (!a) continue
      if (!isValidAddress(a, slug)) { invalid.push(`${coin}: ${a}`); continue }
      set.add(normalizeAddress(a, slug))
    }
  }
  if (unmapped.size) sdk.log('bybit: skipped unmapped PoR chains:', [...unmapped].join(', '))
  if (invalid.length) sdk.log('bybit: skipped invalid PoR addresses:', invalid.join(', '))
  return Object.fromEntries(Object.entries(byChain).map(([slug, set]) => [slug, [...set]]))
}

const getOwners = () => getConfig('bybit-por', undefined, { fetcher: async () => parseOwnersByChain(await fetchLatestCsv()) })

// chains Bybit doesn't list in its PoR CSV but still hold balances
const STATIC_OWNERS = {
  cardano: ['addr1v8mn6dmk7tf9u26kr09a05lmvc9j4k9d940a88ta3hdczqgyt7whl'],
  fantom: ['0xf89d7b9c864f589bbF53a82105107622B35EaA40'],
  starknet: ['0x076601136372fcdbbd914eea797082f7504f828e122288ad45748b0c8b0c9696'],
  ethereum: ['0x31cc188c4c8db0bb5d30ff7c74e04c4d64d81e1b'],
  sui: [
    '0x74385b8eeb0cdf1d4849e340b00f79058b4aa9228322839b327f37a5c784a293',
    '0x7814f6a9f08290a6c000830549c95061fea8d56a9014daeadd5388b3da798930',
    '0x438342fcc00c286a57e0fd3df760e9e0b45f4c2d296de7372b939bc1e145b521',
  ],
  ton: ['UQDGbHH9Gxgldhg_ZuWDIRACd0S5BX8Y_8IjgnlWRACuPE4U'],
}

// Chains whose PoR balance sits in a token that has no default list in helper/cex.js
const EXTRA_TOKENS = {
  berachain: ['0x0000000000000000000000000000000000000000', '0x779Ded0c9e1022225f8E0630b35a9b54bE713736'], // BERA, USDT0
}

module.exports = { bitcoin: 'bybit' }
for (const slug of new Set(Object.values(CHAIN_MAP)))
  module.exports[slug] = { owners: async () => (await getOwners())[slug] || [] }
for (const [slug, owners] of Object.entries(STATIC_OWNERS)) {
  const csvOwners = module.exports[slug]?.owners
  module.exports[slug] = { owners: csvOwners ? async () => {
    const discovered = await csvOwners()
    const known = new Set(discovered.map(owner => normalizeAddress(owner, slug).toLowerCase()))
    return [...discovered, ...owners.filter(owner => !known.has(normalizeAddress(owner, slug).toLowerCase()))]
  } : owners }
}
for (const [slug, tokens] of Object.entries(EXTRA_TOKENS))
  module.exports[slug].tokens = tokens
