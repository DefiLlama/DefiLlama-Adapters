const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { getEnv } = require('../env')

const url = addr => 'https://blockstream.info/api/address/' + addr

const delay = 3 * 60 * 60 // 3 hours
const balancesNow = {

}

async function getBalanceNow(addr) {
  if (balancesNow[addr]) return balancesNow[addr]

  const { chain_stats: {
    funded_txo_sum, spent_txo_sum,
  } } = await get(url(addr))

  balancesNow[addr] =  (funded_txo_sum - spent_txo_sum) / 1e8
  return balancesNow[addr]
}

async function sumTokens({ balances = {}, owners = [], timestamp }) {
  const bitBals = []
  for (const addr of owners)
    bitBals.push(await getBalance(addr, timestamp))
  sdk.util.sumSingleBalance(balances, 'bitcoin', bitBals.reduce((a, i) => a + i, 0))
  return balances
}

async function getBalance(addr, timestamp) {
  const now = Date.now() / 1e3
  let balance = await getBalanceNow(addr)

  if (!timestamp || (now - timestamp) < delay) return balance

  let endpoint = `https://btc.getblock.io/${getEnv('GETBLOCK_KEY')}/mainnet/blockbook/api/v2/balancehistory/${addr}?fiatcurrency=btc&groupBy=86400&from=${timestamp}`

  const response = await get(endpoint)
  response.forEach(({ sent, received }) => balance += sent / 1e8 - received / 1e8)
  sdk.log('bitcoin balance', addr, balance)
  return balance
}

module.exports = {
  sumTokens
}
