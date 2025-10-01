const adapter = require('./projects/zealousswap')
const sdk = require('@defillama/sdk')

async function main() {
  const chain = 'kasplex'
  const tvlFn = adapter[chain]?.tvl
  if (!tvlFn) throw new Error('kasplex.tvl not found in adapter')
  const api = new sdk.ChainApi({ chain, timestamp: Math.floor(Date.now()/1000) })
  const balances = await tvlFn(api)
  console.log('Balances:', balances || await api.getBalances())
}
main().catch(e => (console.error(e), process.exit(1)))
