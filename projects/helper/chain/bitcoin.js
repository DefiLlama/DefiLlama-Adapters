const sdk = require('@defillama/sdk')
const { get, post } = require('../http')
const { getEnv } = require('../env')
const { getUniqueAddresses } = require('../tokenMapping')
const { RateLimiter } = require("limiter");
const { sliceIntoChunks, sleep } = require('../utils');

const url = addr => 'https://blockstream.info/api/address/' + addr
const url2 = addr => 'https://rpc.ankr.com/http/btc_blockbook/api/address/' + addr
const url3 = addrs => 'https://blockchain.info/multiaddr?active=' + addrs.join('|')

const delay = 3 * 60 * 60 // 3 hours
const balancesNow = {

}

const bitcoinCacheEnv = getEnv('BITCOIN_CACHE_API')


const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 10_000 });

async function cachedBTCBalCall(owners, retriesLeft = 2) {
  try {
    const res = await post(bitcoinCacheEnv, { addresses: owners, network: 'BTC' })
    return res
  } catch (e) {
    console.error('cachedBTCBalCall error', e.toString())
    if (retriesLeft > 0) {
      return await cachedBTCBalCall(owners, retriesLeft - 1)
    }
    throw e
  }
}

async function getCachedBitcoinBalances(owners) {
  const chunks = sliceIntoChunks(owners, 700)
  sdk.log('bitcoin cache api call: ', owners.length, chunks.length)
  let sum = 0
  let i = 0
  for (const chunk of chunks) {
    const res = await cachedBTCBalCall(chunk)
    sdk.log(i++, sum / 1e8, res / 1e8, chunk.length)
    sum += +res
  }
  return sum
}

async function _sumTokensBlockchain({ balances = {}, owners = [], forceCacheUse, }) {
  if (bitcoinCacheEnv && owners.length > 51) {
    if (owners.length > 1000) forceCacheUse = true
    try {
      const res = await getCachedBitcoinBalances(owners)
      sdk.util.sumSingleBalance(balances, 'bitcoin', res / 1e8)
      return balances

    } catch (e) {
      if (forceCacheUse) throw e
      sdk.log('bitcoin cache error', e.toString())
    }
  }
  console.time('bitcoin' + owners.length + '___' + owners[0])
  const STEP = 50
  for (let i = 0; i < owners.length; i += STEP) {
    const { addresses } = await get(url3(owners.slice(i, i + STEP)))
    for (const addr of addresses)
        sdk.util.sumSingleBalance(balances, 'bitcoin', addr.final_balance / 1e8)
    await sleep(10000)
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

async function sumTokens({ balances = {}, owners = [], timestamp, forceCacheUse, }) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  owners = getUniqueAddresses(owners, 'bitcoin')
  const now = Date.now() / 1e3

  if (!timestamp || (now - timestamp) < delay) {
    try {
      await sumTokensBlockchain({ balances, owners, forceCacheUse })
      // console.log('bitcoin sumTokens from blockchain done', balances)
      return balances
    } catch (e) {
      sdk.log('bitcoin sumTokens error', e.toString())
    }
  }
  if (forceCacheUse) throw new Error('timestamp is too old, cant pull with forceCacheUse flag set')

  for (const addr of owners)
    sdk.util.sumSingleBalance(balances, 'bitcoin', await getBalance(addr, timestamp))
  return balances
}

// async function getBalance(addr, timestamp) {
//   const now = Date.now() / 1e3
//   let balance = await getBalanceNow(addr)

//   if (!timestamp || (now - timestamp) < delay) return balance

//   let endpoint = `https://btc.getblock.io/${getEnv('GETBLOCK_KEY')}/mainnet/blockbook/api/v2/balancehistory/${addr}?fiatcurrency=btc&groupBy=86400&from=${timestamp}`

//   const response = await get(endpoint)
//   response.forEach(({ sent, received }) => balance += sent / 1e8 - received / 1e8)
//   sdk.log('bitcoin balance', addr, balance)
//   return balance
// }

// get archive BTC balance
async function getBalance(addr, timestamp) {
  let balance = 0

  if (timestamp > (Date.now() / 1e3) - 30 * 60) { // 30 minutes ago
    const endpoint = url(addr) + '/utxo'
    const utxos = await get(endpoint)

    for (const utxo of utxos) {
      if (utxo.status.block_time <= timestamp) {
        balance += utxo.value / 1e8
      }
    }
  } else {
    const endpoint = url(addr) + '/txs'
    let txs = await get(endpoint)

    while (txs.length) {
      for (const tx of txs) {
        if (tx.status.block_time <= timestamp) {
          for (const vin of tx.vin) {
            if (vin.prevout.scriptpubkey_address === addr) {
              balance -= vin.prevout.value / 1e8
            }
          }

          for (const vout of tx.vout) {
            if (vout.scriptpubkey_address === addr) {
              balance += vout.value / 1e8
            }
          }
        }
      }

      const next = `${endpoint}/chain/${txs[txs.length - 1].txid}`
      txs = await get(next)
    }
  }

  return balance
}

module.exports = {
  sumTokens
}
