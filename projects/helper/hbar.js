const http = require('./http')
const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')

const HBAR_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'

async function getHBARBalance(address, timestamp) {
  const tsString = timestamp ? `&timestamp=${timestamp}` : ''
  const response = await http.get(`${HBAR_API_V1}/balances?account.id=${address}${tsString}`)
  return response.balances[0].balance
}

async function addHBarBalance({ balances = {}, address, timestamp }) {
  let balance = await getHBARBalance(address, timestamp)
  balance = BigNumber(balance).shiftedBy(-1 * 8).toFixed(0)
  sdk.util.sumSingleBalance(balances, 'hedera-hashgraph', balance)
  return balances
}

module.exports = {
  addHBarBalance
}