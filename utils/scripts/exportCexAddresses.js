// Exports every CEX wallet as { exchange, chain, address } rows: the cex registry plus the CEX adapters that expose
// `_rawConfig`, with owner lists fetched at runtime resolved. Any failure fails the run, so a partial list is never stored.
//   node utils/scripts/exportCexAddresses.js [--dry]   --dry prints the count, writes nothing
require('dotenv').config()
const sdk = require('@defillama/sdk')
const bitcoinBook = require('../../projects/helper/bitcoin-book/index.js')

const STORE_KEY = 'tvl-adapter-cache/cache/cex-addresses/latest.json'
const ADAPTERS = ['binance', 'bitfinex', 'bitget', 'bitrue-cex', 'bitstamp', 'coinex', 'gate-io', 'gemini', 'huobi', 'kucoin', 'okex']
const EVM_RE = /^0x[0-9a-fA-F]{40}$/

async function run() {
  const dry = process.argv.includes('--dry')
  // Without R2_CONFIG.private the sdk skips the upload silently.
  const hasR2 = Boolean(process.env.R2_CONFIG && JSON.parse(process.env.R2_CONFIG).private)
  if (!dry && !hasR2) throw new Error('R2 credentials are not set')

  const configs = { ...require('../../cex/index.js')._rawConfigs }
  for (const name of ADAPTERS) configs[name] = require(`../../projects/${name}/index.js`)._rawConfig

  const rows = new Map()
  for (const [exchange, config] of Object.entries(configs)) {
    for (const [chain, value] of Object.entries(config)) {
      // `bitcoin` can name a list in the bitcoin address book instead of listing owners.
      const chainConfig = chain === 'bitcoin' && typeof value === 'string' ? { owners: bitcoinBook[value] } : value
      const owners = typeof chainConfig?.owners === 'function' ? await chainConfig.owners(new sdk.ChainApi({ chain })) : chainConfig?.owners
      for (const owner of owners ?? []) {
        const address = EVM_RE.test(owner) ? owner.toLowerCase() : owner
        rows.set(`${exchange}:${chain}:${address}`, { exchange, chain, address })
      }
    }
  }

  const list = [...rows.values()]
  console.log(`${list.length} addresses from ${new Set(list.map((row) => row.exchange)).size} exchanges`)
  if (dry) return console.log(`--dry: not written to ${STORE_KEY}`)
  const written = await sdk.cache.writeCache(STORE_KEY, list, { private: true })
  if (!written) throw new Error(`${STORE_KEY} not written`)
  console.log(`wrote ${written.length}B to ${STORE_KEY}`)
}

run().then(() => process.exit(0), (e) => {
  console.error(e)
  process.exit(1)
})
