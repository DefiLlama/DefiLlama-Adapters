// Coinbase's cbLTC custody addresses, read live from its proof-of-reserves (the reserve set rotates,
// so a hardcoded list goes stale). Shared with the coinbase-btc TVL adapter and checkBTCDupsv2.
const { getConfig } = require('../cache')

module.exports = async function coinbaseCbltcReserves() {
  const { reserveAddresses = [] } = await getConfig(
    'coinbase-cbltc-proof-of-reserves',
    'https://www.coinbase.com/cbltc/proof-of-reserves.json'
  )
  return reserveAddresses.map(r => r.address).filter(Boolean)
}
