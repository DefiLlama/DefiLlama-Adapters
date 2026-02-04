const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { sleep } = require('../utils')

const endpoint = 'https://acala.api.subscan.io/api/v2/scan/search'

async function getBalance(key) {
  const data = await post(endpoint, { key }, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'f89d810db5ef4c4fbc83b987dc2ffcda'
    }
  })
  return +(data?.data?.account?.balance ?? 0)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
    await sleep(3000)
  }
  sdk.util.sumSingleBalance(balances, 'acala', total)
  return balances
}

module.exports = {
  sumTokens
}