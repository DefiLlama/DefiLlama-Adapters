const sdk = require('@defillama/sdk')
const { get } = require('../http')
const { getCache, setCache } = require('../cache')
const env = require('../env')

const url = addr => 'https://blockstream.info/api/address/' + addr

const project = 'bitcoin'
const delay = 3 * 60 * 60 // 3 hours

async function getBalanceNow(addr) {
  const { chain_stats: {
    funded_txo_sum, spent_txo_sum,
  } } = await get(url(addr))

  return (funded_txo_sum - spent_txo_sum) / 1e8
}

async function sumTokens({ balances = {}, owners = [], timestamp }) {
  const bitBals = []
  for (const addr of owners)
    bitBals.push(getBalance(addr, timestamp))
  sdk.util.sumSingleBalance(balances, 'bitcoin', bitBals.reduce((a, i) => a + i, 0))
  return balances
}

async function getBalance(addr, timestamp) {
  const now = Date.now() / 1e3
  if (!timestamp || (now - timestamp) < delay) return getBalanceNow(addr)

  let cache = await getCache(project, addr)
  if (!Array.isArray(cache)) cache = [] // initialize cache

  const currentCacheLength = cache.length
  sdk.log('bitcoin', addr, currentCacheLength)
  let endpoint = `https://btc.getblock.io/${env.GETBLOCK_KEY}/mainnet/blockbook/api/v2/balancehistory/${addr}?fiatcurrency=btc&groupBy=86400`

  if (cache.length) {
    const startTime = cache.reduce((a, i) => a > i.time ? a : i.time, 0)
    endpoint += `&from=${startTime}`
  }
  
  const response = await get(endpoint)

  const timeKeys = new Set(cache.map(i => i.time))
  response.filter(i => !timeKeys.has(i.time)).forEach(i => cache.push(i))
  if (cache.length > currentCacheLength)  await setCache(project, addr, cache)

  let balance = 0
  cache.filter(i => (!timestamp || i.time < timestamp))
    .forEach(({ sent, received }) => balance += +received - +sent)

  sdk.log('bitcoin balance', addr, balance/1e8)
  return balance / 1e8

}

module.exports = {
  sumTokens
}