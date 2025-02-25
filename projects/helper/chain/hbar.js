const http = require('../http')
const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')

const HBAR_API_V1 = 'https://mainnet-public.mirrornode.hedera.com/api/v1'

async function getHBARBalance(address, timestamp) {
  const tsString = timestamp ? `&timestamp=${timestamp}` : ''
  const response = await http.get(`${HBAR_API_V1}/balances?account.id=${address}${tsString}`)
  return response.balances[0].balance
}

async function getCurrentBlock() {
  const { blocks: [{ number }]} = await http.get(HBAR_API_V1+'/blocks?limit=1&order=desc')
  return number
}

async function addHBarBalance({ balances = {}, address, timestamp }) {
  let balance = await getHBARBalance(address, timestamp)
  balance = BigNumber(balance).shiftedBy(-1 * 8).toFixed(0)
  sdk.util.sumSingleBalance(balances, 'hedera-hashgraph', balance)
  return balances
}

async function sumTokens({ balances = {}, owners = [], timestamp }) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  const promises = owners.map(address => addHBarBalance({ timestamp, balances, address}))
  await Promise.all(promises)
  return balances
}

module.exports = {
  addHBarBalance,
  sumTokens,
  getCurrentBlock,
}