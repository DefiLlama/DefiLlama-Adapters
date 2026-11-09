// Values every XRPL AMM pool with amm_info at one validated ledger. Too slow for the hourly runner (about 32k reads), so the
// custom-scripts runner (helper/custom-scripts/sushi-analytics-v2, bulky group) runs it and stores the result for ./index.js.
// XRPScan is used only to list the pools. Test with: node test.js projects/xrpl-dex/api.js
const sdk = require('@defillama/sdk')
const axios = require('axios')
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

const { xrpl } = sdk.chains
const PROJECT = 'xrpl-dex'
const POOL_LIST_URL = 'https://api.xrpscan.com/api/v1/amm/pools'
const PAGE_SIZES = [5000, 1000, 2500]
const MAX_POOL_ROWS = 100000
const RLUSD = '524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
const MIN_POOLS = 20000 // the ledger held 32,121 AMM pools on 2026-11-09
const MAX_DELETED_SHARE = 0.01 // a normal run sees about 10 pools deleted between listing and reading
const CONCURRENCY = 20 // the sdk caps in-flight XRPL requests at 5, extra slots stay busy during retry waits
const RPC_TIMEOUT = 10_000
const LEDGER_LAG = 10
const RLUSD_DECIMALS = 6 // coins-server decimals for RLUSD on ripple, see helper/sumTokens.js

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// amm_info amount: XRP as a drops string, issued tokens as { currency, issuer, value }, MPTs as { mpt_issuance_id, value }
const parseSide = (s) => typeof s === 'string' ? ['XRP', Number(s) / 1e6]
  : [s.mpt_issuance_id ? `MPT.${s.mpt_issuance_id}` : `${s.currency}.${s.issuer}`, Number(s.value)]

async function getPoolPage(offset, limit) {
  for (let attempt = 1; ; attempt++) {
    try {
      const { data } = await axios.get(POOL_LIST_URL, { params: { limit, offset }, timeout: 60_000 })
      if (!Array.isArray(data)) throw new Error('unexpected pool list response')
      return data
    } catch (e) {
      if (attempt >= 3) throw e
      await sleep(5_000 * attempt)
    }
  }
}

// XRPScan sorts by the pool's XRP balance, which moves between requests and ties at 0, so one offset walk skips pools
async function listPools() {
  const accounts = new Set()
  let rows = 0
  for (const limit of PAGE_SIZES) {
    rows = 0
    for (let offset = 0; offset < MAX_POOL_ROWS; offset += limit) {
      const data = await getPoolPage(offset, limit)
      data.forEach((pool) => { if (pool?.Account) accounts.add(pool.Account) })
      rows += data.length
      if (data.length < limit) break
    }
    console.log(`${PROJECT}: pool list walk of ${limit}: ${rows} rows, ${accounts.size} unique so far`)
    if (accounts.size >= rows) return [...accounts]
  }
  throw new Error(`${PROJECT}: pool list incomplete, ${accounts.size} unique of ${rows} rows`)
}

// keep only the endpoints that serve the pinned ledger, so a lagging or hanging node cannot stall the run
async function pickEndpoints(ledgerIndex) {
  const healthy = []
  for (const url of xrpl.getEndpoints()) {
    try {
      const { data } = await axios.post(url, { method: 'ledger', params: [{ ledger_index: ledgerIndex }] }, { timeout: 5_000 })
      if (data?.result?.validated) healthy.push(url)
      else console.error(`${PROJECT}: endpoint ${url} skipped: ledger ${ledgerIndex} not served`)
    } catch (e) {
      console.error(`${PROJECT}: endpoint ${url} skipped: ${e.message}`)
    }
  }
  if (!healthy.length) throw new Error(`${PROJECT}: no endpoint serves ledger ${ledgerIndex}`)
  return healthy
}

async function readPools(accounts, ledgerIndex) {
  const pools = []
  const deleted = []
  let pending = accounts
  for (let pass = 1; pass <= 3 && pending.length; pass++) {
    if (pass > 1) await sleep(30_000)
    const failed = []
    await PromisePool.withConcurrency(CONCURRENCY).for(pending).process(async (account) => {
      try {
        const { amm } = await xrpl.rpc('amm_info', { amm_account: account }, { ledgerIndex, timeout: RPC_TIMEOUT })
        pools.push({ account, amount: amm.amount, amount2: amm.amount2 })
      } catch (e) {
        // amm_info answers actMalformed for an account that is not (or no longer) an AMM
        if (e?.error === 'actNotFound' || e?.error === 'actMalformed') deleted.push(account)
        else failed.push(account)
      }
    })
    console.log(`${PROJECT}: pass ${pass}: ${pools.length} read, ${deleted.length} deleted, ${failed.length} failed`)
    pending = failed
  }
  if (pending.length) throw new Error(`${PROJECT}: ${pending.length} pools unread after 3 passes (${pending.slice(0, 5).join(', ')})`)
  if (deleted.length > accounts.length * MAX_DELETED_SHARE)
    throw new Error(`${PROJECT}: ${deleted.length} of ${accounts.length} pools reported deleted, more than ${MAX_DELETED_SHARE * 100}%`)
  return pools
}

async function tvl(api) {
  const accounts = await listPools()
  if (accounts.length < MIN_POOLS) throw new Error(`${PROJECT}: only ${accounts.length} pools listed`)

  const latest = await xrpl.getLatestLedger()
  const ledger = await xrpl.getLedger({ ledgerIndex: latest.number - LEDGER_LAG })
  const endpoints = await pickEndpoints(ledger.number)
  console.log(`${PROJECT}: ${accounts.length} pools listed, ledger ${ledger.number}, endpoints: ${endpoints.join(' ')}`)

  // the sdk reads the endpoint list from env on every call, restore it since the runner shares the process
  const previous = process.env.XRPL_WHITELISTED_RPC
  process.env.XRPL_WHITELISTED_RPC = endpoints.join(',')
  let pools
  try {
    pools = await readPools(accounts, ledger.number)
  } finally {
    if (previous === undefined) delete process.env.XRPL_WHITELISTED_RPC
    else process.env.XRPL_WHITELISTED_RPC = previous
  }
  if (pools.length < MIN_POOLS) throw new Error(`${PROJECT}: only ${pools.length} pools read`)

  const data = pools.map(({ amount, amount2 }) => {
    const [token0, token0Bal] = parseSide(amount)
    const [token1, token1Bal] = parseSide(amount2)
    return { token0, token0Bal, token1, token1Bal }
  }).filter((p) => p.token0Bal > 0 && p.token1Bal > 0) // an emptied AMM keeps its account until AMMDelete
  if (data.length < MIN_POOLS) throw new Error(`${PROJECT}: only ${data.length} of ${pools.length} pools have reserves`)

  const { XRP: xrp = 0, [RLUSD]: rlusd = 0 } = transformDexBalances({ chain: api.chain, coreTokens: new Set(['XRP', RLUSD]), data })
  api.addCGToken('ripple', xrp)
  if (rlusd) api.add(RLUSD, rlusd * 10 ** RLUSD_DECIMALS)
  console.log(`${PROJECT}: ledger ${ledger.number} closed ${new Date(ledger.timestamp * 1000).toISOString()}, ${data.length} of ${pools.length} pools valued`)
  return api.getBalances() // the custom-scripts runner stores what tvl returns
}

module.exports = {
  timetravel: false,
  ripple: { tvl },
}
