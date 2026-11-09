// Custom script (Jenkins job tvl-custom-scripts/xrpl-dex): values every XRPL AMM pool and publishes the
// balances to the custom-scripts log, which projects/xrpl-dex/index.js reads (same pattern as metadao).
//
// Why it changed: the old job listed pools with a full ledger_data walk on xrplcluster.com, which is now
// rate limited ("units quota (10000 per 60s) exhausted" on the first page; the same walk is about 9,900
// pages of 9-12 s on the public Clio nodes), and read reserves from XRPScan. Its cache was last written on
// 2025-03-18, so the adapter has served 26,830,826.65581 XRP since 2025-05-14.
//
// Steps:
//  1. discovery only: XRPScan pool list (GET /api/v1/amm/pools, 5000 per page)
//  2. pin a validated ledger 10 behind the tip and keep only endpoints that serve it
//  3. amounts: amm_info for every pool at that ledger via sdk.chains.xrpl, up to 3 passes; every pool must be
//     read or confirmed deleted, otherwise nothing is published
//  4. value with ./value.js, publish with sdk.elastic.writeLog and read the record back
//
// Endpoints: sdk defaults (xrplcluster.com, s1/s2.ripple.com). XRPL_RPC adds endpoints in front of the
// defaults; XRPL_WHITELISTED_RPC replaces them. Set XRPL_DEX_DRY_RUN=1 to print the balances without publishing.
const sdk = require('@defillama/sdk')
const axios = require('axios')
const { PromisePool } = require('@supercharge/promise-pool')
const { valuePools, RLUSD } = require('./value')

const { xrpl } = sdk.chains
const PROJECT = 'xrpl-dex'
const CHAIN = 'ripple'
const POOL_LIST_URL = 'https://api.xrpscan.com/api/v1/amm/pools'
const PAGE_SIZE = 5000
const MAX_PAGES = 20
const MIN_POOLS = 20000 // the ledger held 32,117 AMM pools on 2026-11-09
const MAX_DELETED_SHARE = 0.01 // a normal run sees about 10 pools deleted between listing and reading
const CONCURRENCY = 20 // the sdk caps in-flight XRPL requests at 5; extra slots stay busy during retry waits
const RPC_TIMEOUT = 10_000
const LEDGER_LAG = 10
const RLUSD_DECIMALS = 6 // coins-server decimals for RLUSD on ripple, see helper/sumTokens.js
const DRY_RUN = !!process.env.XRPL_DEX_DRY_RUN

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const envValue = (key) => process.env['LLAMA_SDK_' + key] ?? process.env['SDK_' + key] ?? process.env[key]

async function getPoolPage(offset) {
  for (let attempt = 1; ; attempt++) {
    try {
      const { data } = await axios.get(POOL_LIST_URL, { params: { limit: PAGE_SIZE, offset }, timeout: 60_000 })
      if (!Array.isArray(data)) throw new Error('unexpected pool list response')
      return data
    } catch (e) {
      if (attempt >= 3) throw e
      await sleep(5_000 * attempt)
    }
  }
}

async function listPools() {
  const accounts = new Set()
  let offset = 0
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await getPoolPage(offset)
    if (!data.length) break
    data.forEach((pool) => { if (pool?.Account) accounts.add(pool.Account) })
    offset += data.length
  }
  return [...accounts]
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
  process.env.XRPL_WHITELISTED_RPC = healthy.join(',')
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

async function verifyPublished(timestamp) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    await sleep(5_000)
    const res = await sdk.elastic.search({
      index: 'custom-scripts*',
      body: {
        query: { bool: { must: [{ match: { project: PROJECT } }, { match: { chain: CHAIN } }, { match: { 'metadata.type': 'tvl' } }] } },
        sort: [{ timestamp: { order: 'desc' } }],
        size: 1,
      },
    })
    if (res?.hits?.hits?.[0]?._source?.timestamp === timestamp) return
  }
  throw new Error(`${PROJECT}: published record for ${timestamp} not found in custom-scripts`)
}

async function main() {
  if (!DRY_RUN && !envValue('ELASTICSEARCH_CONFIG')) throw new Error(`${PROJECT}: ELASTICSEARCH_CONFIG is not set, nothing would be published`)

  const accounts = await listPools()
  if (accounts.length < MIN_POOLS) throw new Error(`${PROJECT}: only ${accounts.length} pools listed`)

  const latest = await xrpl.getLatestLedger()
  const ledger = await xrpl.getLedger({ ledgerIndex: latest.number - LEDGER_LAG })
  const endpoints = await pickEndpoints(ledger.number)
  console.log(`${PROJECT}: ${accounts.length} pools listed, ledger ${ledger.number}, endpoints: ${endpoints.join(' ')}`)

  const pools = await readPools(accounts, ledger.number)
  if (pools.length < MIN_POOLS) throw new Error(`${PROJECT}: only ${pools.length} pools read`)

  const { xrp, tokens, stats } = valuePools(pools)
  const api = new sdk.ChainApi({ chain: CHAIN })
  api.addCGToken('ripple', xrp)
  if (tokens[RLUSD]) api.add(RLUSD, tokens[RLUSD] * 10 ** RLUSD_DECIMALS)
  const balances = api.getBalances()
  console.log(`${PROJECT}: ledger ${ledger.number} closed ${new Date(ledger.timestamp * 1000).toISOString()}`, JSON.stringify(stats), balances)

  if (DRY_RUN) return
  await sdk.elastic.writeLog('custom-scripts', {
    metadata: { type: 'tvl' },
    chain: CHAIN,
    project: PROJECT,
    balances,
    timestamp: ledger.timestamp,
  })
  await verifyPublished(ledger.timestamp)
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
