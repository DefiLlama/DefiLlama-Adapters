const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses } = require('../tokenMapping')
const { RateLimiter } = require("limiter");

const url = addr => 'https://blockstream.info/api/address/' + addr
const url2 = addr => 'https://rpc.ankr.com/http/btc_blockbook/api/address/' + addr
const url3 = addrs => 'https://blockchain.info/multiaddr?active=' + addrs.join('|')

const delay = 3 * 60 * 60 // 3 hours
const balancesNow = {

}


const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 10_000 });

async function _sumTokensBlockchain({ balances = {}, owners = [], }) {
  console.time('bitcoin' + owners.length + '___' + owners[0])
  const STEP = 200
  for(let i=0; i<owners.length; i+=STEP){
    const { addresses } = await get(url3(owners.slice(i, i+STEP)))
    for (const addr of addresses)
      sdk.util.sumSingleBalance(balances, 'bitcoin', addr.final_balance / 1e8)
  }

  console.timeEnd('bitcoin' + owners.length + '___' + owners[0])
  return balances
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
  await limiter.removeTokens(tokensToRemove);
  return fn(...args);
}

const sumTokensBlockchain = withLimiter(_sumTokensBlockchain)

async function getBalanceNow(addr) {
  if (balancesNow[addr]) return balancesNow[addr]
  try {

    const { chain_stats: {
      funded_txo_sum, spent_txo_sum,
    } } = await get(url(addr))

    balancesNow[addr] = (funded_txo_sum - spent_txo_sum) / 1e8

  } catch (e) {
    sdk.log('bitcoin balance error', addr, e.toString())

    const { balance } = await get(url2(addr))
    balancesNow[addr] = balance
  }

  return balancesNow[addr]
}

async function sumTokens({ balances = {}, owners = [], timestamp }) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  owners = getUniqueAddresses(owners, 'bitcoin')
  const now = Date.now() / 1e3

  if (!timestamp || (now - timestamp) < delay) {
    try {
      await sumTokensBlockchain({ balances, owners })
      return balances
    } catch (e) {
      sdk.log('bitcoin sumTokens error', e.toString())
    }
  }

  for (const addr of owners)
    sdk.util.sumSingleBalance(balances, 'bitcoin', await getBalance(addr, timestamp))
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
