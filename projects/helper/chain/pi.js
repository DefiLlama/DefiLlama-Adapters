const sdk = require('@defillama/sdk')
const { get } = require('../http')

// Pi mainnet is a Stellar fork, so it speaks the Horizon API
const url = addr => 'https://api.mainnet.minepi.com/accounts/' + addr

async function getBalance(addr) {
  const { balances } = await get(url(addr))
  if (!balances) throw new Error(`Unexpected Pi horizon response for ${addr}`)
  // only the native balance is counted - Pi has no issued assets worth pricing
  const native = balances.find(i => i.asset_type === 'native')
  return +(native?.balance ?? 0)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  for (const owner of owners)
    total += await getBalance(owner)

  sdk.util.sumSingleBalance(balances, 'coingecko:pi-network', total)
  return balances
}

module.exports = {
  sumTokens
}
