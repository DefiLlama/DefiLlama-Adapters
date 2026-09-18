const sdk = require('@defillama/sdk')
const { get } = require('../http')

const url = addr => 'https://api.whatsonchain.com/v1/bsv/main/address/' + addr + '/balance'

async function getBalance(addr) {
  const { confirmed, unconfirmed } = await get(url(addr))
  if (typeof confirmed !== 'number')
    throw new Error(`Unexpected whatsonchain balance response for ${addr}`)
  return (confirmed + unconfirmed) / 1e8 // satoshis -> BSV
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0

  // whatsonchain rate limits aggressively and answers a throttled request with a
  // body that has no `confirmed` field - going one at a time keeps the helper from
  // silently under-counting (getBalance throws rather than treating that as zero)
  for (const owner of owners)
    total += await getBalance(owner)

  sdk.util.sumSingleBalance(balances, 'coingecko:bitcoin-cash-sv', total)
  return balances
}

module.exports = {
  sumTokens
}
