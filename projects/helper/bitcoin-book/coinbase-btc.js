// Coinbase's cbBTC custody addresses, read live from its proof-of-reserves. The reserve set rotates
// over time (a hardcoded list silently drains to zero), so we pull it dynamically. Shared with the
// coinbase-btc TVL adapter and with checkBTCDupsv2, so both reference the same current address set.
const { getConfig } = require('../cache')

module.exports = async function coinbaseCbbtcReserves() {
  const { reserveAddresses = [] } = await getConfig(
    'coinbase-cbbtc-proof-of-reserves',
    'https://www.coinbase.com/cbbtc/proof-of-reserves.json'
  )
  return reserveAddresses.map(r => r.address).filter(Boolean)
}
