// Explorer transport (blockstream / mempool.space / blockbook, blockchain.info multiaddr batching and the
// BITCOIN_CACHE_API bulk cache) lives in @defillama/sdk (`sdk.chains.utxo`); balances come back in satoshis
// and are converted to BTC here so `sumTokens` keeps returning whole coins.
const sdk = require('@defillama/sdk')
const { getUniqueAddresses } = require('../tokenMapping')
const { getEnv } = require('../env')

const { utxo } = sdk.chains
const CHAIN = 'bitcoin'
const DECIMALS = utxo.CHAINS[CHAIN].decimals

const delay = 3 * 60 * 60 // 3 hours

async function sumTokensBlockchain({ balances = {}, owners = [], forceCacheUse, }) {
  const sats = await utxo.getTotalBalance({ chain: CHAIN, addresses: owners, forceCacheUse })
  sdk.util.sumSingleBalance(balances, 'bitcoin', utxo.fromBaseUnits(sats, DECIMALS))
  return balances
}

async function sumTokens({ balances = {}, owners = [], timestamp, forceCacheUse, }) {
  if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
  owners = getUniqueAddresses(owners, 'bitcoin')
  const now = Date.now() / 1e3

  if (!timestamp || (now - timestamp) < delay) {
    try {
      await sumTokensBlockchain({ balances, owners, forceCacheUse })
      return balances
    } catch (e) {
      sdk.log('bitcoin sumTokens error', e.toString())
    }
  }
  if (forceCacheUse) throw new Error('timestamp is too old, cant pull with forceCacheUse flag set')

  const isRefill = timestamp % 86400 === 0 && utcDate(timestamp) < utcDate(now) // day-start run for a past day
  if (owners.length && isRefill && getEnv('ALLIUM_API_KEY')) {
    try {
      sdk.util.sumSingleBalance(balances, 'bitcoin', await getAlliumBalance(owners, timestamp))
      return balances
    } catch (e) {
      sdk.log('bitcoin allium error', e.toString())
    }
  }

  for (const addr of owners)
    sdk.util.sumSingleBalance(balances, 'bitcoin', await getBalance(addr, timestamp))
  return balances
}

const utcDate = (ts) => new Date(ts * 1e3).toISOString().slice(0, 10)

// refills: one Allium end-of-day snapshot query instead of an archive walk per address
async function getAlliumBalance(owners, timestamp) {
  const { queryAllium } = require('../allium')
  const date = utcDate(timestamp - 86400)
  const [{ sats }] = await queryAllium(`
    SELECT SUM(raw_balance) AS sats FROM (
      SELECT raw_balance FROM bitcoin.assets.balances_daily
      WHERE address IN (${owners.map((a) => `'${a}'`).join(',')}) AND date <= '${date}'
      QUALIFY ROW_NUMBER() OVER (PARTITION BY address ORDER BY date DESC) = 1)`)
  return utxo.fromBaseUnits(sats ?? 0, DECIMALS)
}

// archive BTC balance (whole coins) at `timestamp`
async function getBalance(addr, timestamp) {
  const sats = await utxo.getBitcoinBalanceAt({ chain: CHAIN, address: addr, timestamp })
  return utxo.fromBaseUnits(sats, DECIMALS)
}

module.exports = {
  sumTokens
}
