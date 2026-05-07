const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

const endpoint = 'https://polkadot.api.subscan.io/api/v2/scan/search'

async function getBalance(key) {
  const data = await post(endpoint, { key }, { headers: { 'x-api-key': getEnv('SUBSCAN_API_KEY') }})
  return +(data?.data?.account?.balance ?? 0)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'polkadot', total)
  return balances
}

module.exports = {
  sumTokens
}