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
  const { blocks: [{ number }] } = await http.get(HBAR_API_V1 + '/blocks?limit=1&order=desc')
  return number
}

async function addHBarBalance({ balances = {}, address, timestamp }) {
  let balance = await getHBARBalance(address, timestamp)
  balance = BigNumber(balance).shiftedBy(-1 * 8).toFixed(0)
  sdk.util.sumSingleBalance(balances, 'hedera-hashgraph', balance)
  return balances
}

async function addTokenBalances({ balances, address, tokens }) {
  const tokenSet = new Set(tokens)
  let next = `/accounts/${address}/tokens?limit=100`
  while (next) {
    const res = await http.get(HBAR_API_V1 + next.replace('/api/v1', ''))
    res.tokens.forEach(({ token_id, balance }) => {
      if (!tokenSet.has(token_id)) return
      sdk.util.sumSingleBalance(balances, token_id, balance, 'hedera')
    })
    next = res.links?.next
  }
  return balances
}

async function sumTokens({ balances = {}, owners = [], tokens = [], timestamp }) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  const promises = owners.map(address => addHBarBalance({ timestamp, balances, address }))
  await Promise.all(promises)
  // 0.0.x token ids only - the nullAddress placeholder (native HBAR) is always counted above
  tokens = tokens.filter(t => typeof t === 'string' && t.startsWith('0.0.'))
  if (tokens.length)
    await Promise.all(owners.map(address => addTokenBalances({ balances, address, tokens })))
  return balances
}

module.exports = {
  addHBarBalance,
  sumTokens,
  getCurrentBlock,
}