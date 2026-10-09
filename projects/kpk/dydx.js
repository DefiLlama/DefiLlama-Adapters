// ---- dYdX chain (Cosmos app-chain) leg of the dYdX mandate ----
//
// The dYdX mandate is the one kpk mandate that mostly lives off EVM: its DYDX is
// delegated to validators on dYdX v4, with a little liquid DYDX and USDC in the same
// wallets. DeBank has no view of the chain and the treasury IR store never priced it,
// so this module is that chain's only source.
//
// Today the dYdX LCD answers exactly: bank balances, delegations and the unbonding
// queue.
//
// Historical data cannot be read from the LCD (public archive nodes prune after ~30 days)
// and Allium indexes the bank module only, with no delegations table. So the staked
// series is reconstructed: today's exact delegated total from the LCD is the anchor,
// and every message that changed the stake (delegate / undelegate / cancel-unbonding,
// from Allium) is walked backwards from it. Liquid balances come from Allium's
// per-day bank snapshots. Staked DYDX is ~93% of the chain, so the walk-back is the
// number; the balances are the remainder.
//
// Allium is queried one month at a time and each completed month is written to the
// cache once and never re-queried (only the current month is refreshed). Two reasons:
// Allium's secure views fail above ~200 days and on a few individual days, and a
// 365-day rescan is ~23 GB of scan per run against ~58 MB for a month. The first
// historical run in a fresh cache pays for the history; every later date reads it.
//
// The balances query cannot serve months before 2025-09: those carry millions of USDC
// rows for these addresses and die inside Allium's secure views however the per-day
// pick is written. Dates before 2025-09-01 therefore carry the staked leg only.

const sdk = require('@defillama/sdk')
const axios = require('axios')
const { getEnv } = require('../helper/env')
const { getCache, setCache } = require('../helper/cache')
const { getBalance2, queryV1Beta1V2 } = require('../helper/chain/cosmos')
const { cosmosStaked } = require('../helper/stakingHelper')

const DYDX_ADDRESSES = [
  'dydx1vx93pwuxf7j5c90tukj084ka26fclcjuqdmw2a',
  'dydx1zc0jd76vfluauk6pc6rsq5dkwyjz9h8uqgppj6',
  'dydx1lyrp3zhg6flfjhc508cfg9hp83fu9jsygcw0w0',
  'dydx1lg5qugn9aler55adkkdkdmg7mrk33kddq7zlv9',
  'dydx1krs9h56jyudaytdwjyqk42x82650nhmfhhj0p9',
]

const ADYDX = 'adydx' // priced by DefiLlama as dydx:adydx, 18 decimals
const USDC_IBC = 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5' // 6 decimals
const USDC = 'coingecko:usd-coin' // the IBC denom is not priced, so USDC is added by coingecko id

const DELTAS_START = '2024-11'   // first delegation: 1 DYDX test on 2024-11-05
const BALANCES_START = '2025-09' // earliest month Allium's balances view will answer
const UNBONDING_DAYS = 30        // dYdX v4 unbonding period
const INDEXING_LAG_DAYS = 2      // a month is final this long after it ends
const CURRENT_MONTH_TTL_MS = 24 * 3600e3

const CACHE_PROJECT = 'kpk-dydx'
const CACHE_FILE = 'allium'
const CACHE_VERSION = 1

// ---- Allium queries ----
//
// Last bank balance per (address, currency) on each day it moved, NOT forward-filled;
// the caller does that. QUALIFY ROW_NUMBER rather than MAX_BY: MAX_BY fails outright
// on some days' data here (2026-04-17) with Snowflake's redacted "Error in secure
// object". `balance` is decimal-adjusted.
const BALANCES_SQL = `
SELECT day, address, currency, amount
FROM (
    SELECT
        CAST(block_timestamp AS DATE) AS day,
        address                       AS address,
        currency                      AS currency,
        balance                       AS amount
    FROM dydx.assets.fungible_balances
    WHERE address IN ({{addresses}})
      AND block_timestamp >= TIMESTAMP '{{start}}'
      AND block_timestamp <  TIMESTAMP '{{end}}'
    QUALIFY ROW_NUMBER() OVER (
        PARTITION BY CAST(block_timestamp AS DATE), address, currency
        ORDER BY _pseudo_global_order DESC
    ) = 1
)`

// Every message that changes the stake, with the amount from the matching event.
// `dydx` is in whole DYDX.
const STAKING_DELTAS_SQL = `
WITH msgs AS (
    SELECT block_height, transaction_hash, message_index, sender, CAST(block_timestamp AS DATE) AS day
    FROM dydx.raw.messages
    WHERE sender IN ({{addresses}})
      AND block_timestamp >= TIMESTAMP '{{start}}'
      AND block_timestamp <  TIMESTAMP '{{end}}'
      AND action IN (
          '/cosmos.staking.v1beta1.MsgDelegate',
          '/cosmos.staking.v1beta1.MsgUndelegate',
          '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation'
      )
),
amts AS (
    SELECT block_height, transaction_hash, message_index, event_type, value
    FROM dydx.raw.event_attributes
    WHERE block_timestamp >= TIMESTAMP '{{start}}'
      AND block_timestamp <  TIMESTAMP '{{end}}'
      AND event_type IN ('delegate', 'unbond', 'cancel_unbonding_delegation')
      AND key = 'amount'
)
SELECT
    m.day        AS day,
    m.sender     AS address,
    a.event_type AS event_type,
    SUM(TRY_TO_NUMBER(REGEXP_REPLACE(a.value, '[^0-9]', ''))) / 1e18 AS dydx
FROM msgs m
JOIN amts a
  ON a.block_height     = m.block_height
 AND a.transaction_hash = m.transaction_hash
 AND a.message_index    = m.message_index
GROUP BY m.day, m.sender, a.event_type
ORDER BY m.day`

// sign of each event on the delegated balance
const DELTA_SIGN = { delegate: 1, cancel_unbonding_delegation: 1, unbond: -1 }

// ---- date helpers (all UTC) ----

const dayOf = (ts) => new Date(ts * 1e3).toISOString().slice(0, 10)
const monthOf = (day) => day.slice(0, 7)
const nextMonth = (month) => {
  const [y, m] = month.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}
const monthsFrom = (start, end) => {
  const out = []
  for (let m = start; m <= end; m = nextMonth(m)) out.push(m)
  return out
}
const shiftDay = (day, days) => new Date(Date.parse(`${day}T00:00:00Z`) + days * 86400e3).toISOString().slice(0, 10)

function isMonthFinal(month, now = Date.now()) {
  const closes = Date.parse(`${nextMonth(month)}-01T00:00:00Z`) + INDEXING_LAG_DAYS * 86400e3
  return now >= closes
}

// ---- Allium partition cache ----
//
// { version, months: { 'YYYY-MM': { balances: rows|null, deltas: rows, gaps: [days], final, generatedAt } } }
// `balances` is null for months before BALANCES_START (never asked for). `gaps` are
// the days of the balances query Allium refused (see queryWindow).

const fill = (sql, vars) => sql.replace(/{{(\w+)}}/g, (_, k) => vars[k])
const addressList = DYDX_ADDRESSES.map((a) => `'${a}'`).join(', ')
const isoTs = (d) => d.toISOString().slice(0, 19).replace('T', ' ')
const DAY_MS = 86400e3

const ALLIUM_API = 'https://api.allium.so/api/v1/explorer'
const ALLIUM_QUERY_ID = 'phBjLzIZ8uUIDlp0dD3N' // same shared explorer query the helper submits through
const ALLIUM_POLL_MS = 5e3
const ALLIUM_MAX_WAIT_MS = 10 * 60e3
const alliumHeaders = () => ({ 'Content-Type': 'application/json', 'X-API-KEY': getEnv('ALLIUM_API_KEY') })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function runAllium(sql) {
  const { data: { run_id } } = await axios.post(`${ALLIUM_API}/queries/${ALLIUM_QUERY_ID}/run-async`, { parameters: { fullQuery: sql } }, { headers: alliumHeaders() })
  if (!run_id) throw new Error('kpk dydx: Allium returned no run id')
  const deadline = Date.now() + ALLIUM_MAX_WAIT_MS
  while (true) {
    await sleep(ALLIUM_POLL_MS)
    const { data: status } = await axios.get(`${ALLIUM_API}/query-runs/${run_id}/status`, { headers: alliumHeaders() })
    if (status === 'success') break
    if (status === 'failed' || status === 'canceled') throw new Error(`kpk dydx: Allium run ${run_id} ${status}`)
    if (Date.now() > deadline) throw new Error(`kpk dydx: Allium run ${run_id} still ${status} after ${ALLIUM_MAX_WAIT_MS / 60e3} min`)
  }
  const { data } = await axios.get(`${ALLIUM_API}/query-runs/${run_id}/results?f=json`, { headers: alliumHeaders() })
  return data?.data
}

// Some individual days never come out of Allium's secure views (2026-04-17 is one:
// it fails as a single-day query however it is written), and a window containing
// one fails with a redacted error. A failed window is bisected down to the day; a
// single failing day is recorded as a gap when the caller can live with one, else
// rethrown. Liquid balances forward-fill, so a balances gap only delays a move by a
// day. A deltas gap would silently shift the whole staked history, so those throw.
async function queryWindow(sql, start, end, { tolerateGaps, gaps }) {
  try {
    const rows = await runAllium(fill(sql, { addresses: addressList, start: isoTs(start), end: isoTs(end) }))
    if (!Array.isArray(rows)) throw new Error('no rows array')
    return rows
  } catch (e) {
    const days = Math.round((end - start) / DAY_MS)
    if (days <= 1) {
      const day = start.toISOString().slice(0, 10)
      if (!tolerateGaps) throw new Error(`kpk dydx: Allium refused the staking deltas for ${day}; refusing to build a staked history with a hole in it (${e.message})`)
      sdk.log(`kpk dydx: Allium refused the balances for ${day}, recorded as a gap (forward-filled)`)
      gaps.push(day)
      return []
    }
    const mid = new Date(start.getTime() + Math.floor(days / 2) * DAY_MS)
    return [...await queryWindow(sql, start, mid, { tolerateGaps, gaps }), ...await queryWindow(sql, mid, end, { tolerateGaps, gaps })]
  }
}

const queryMonth = (sql, month, opts) =>
  queryWindow(sql, new Date(`${month}-01T00:00:00Z`), new Date(`${nextMonth(month)}-01T00:00:00Z`), opts)

let partitionsPromise
function loadPartitions() {
  if (!partitionsPromise) partitionsPromise = _loadPartitions()
  return partitionsPromise
}

async function _loadPartitions() {
  let store = await getCache(CACHE_PROJECT, CACHE_FILE)
  if (!store || store.version !== CACHE_VERSION) store = { version: CACHE_VERSION, months: {} }

  const thisMonth = monthOf(dayOf(Math.floor(Date.now() / 1e3)))
  for (const month of monthsFrom(DELTAS_START, thisMonth)) {
    const have = store.months[month]
    const fresh = have && (have.final || Date.now() - Date.parse(have.generatedAt) < CURRENT_MONTH_TTL_MS)
    if (fresh) continue

    const gaps = []
    const deltas = await queryMonth(STAKING_DELTAS_SQL, month, { tolerateGaps: false })
    const balances = month >= BALANCES_START ? await queryMonth(BALANCES_SQL, month, { tolerateGaps: true, gaps }) : null
    store.months[month] = { deltas, balances, gaps, final: isMonthFinal(month), generatedAt: new Date().toISOString() }
    // persist per month so a failure midway keeps what was already bought
    await setCache(CACHE_PROJECT, CACHE_FILE, store)
  }
  return store
}

// ---- LCD (today) ----

async function stakedTodayDydx() {
  // cosmosStaked adds to an api; run it on a scratch one so the anchor can be read back
  const scratch = new sdk.ChainApi({ chain: 'dydx' })
  await cosmosStaked(scratch, DYDX_ADDRESSES)
  const raw = scratch.getBalances()[`dydx:${ADYDX}`] ?? 0
  return Number(raw) / 1e18
}

// whole DYDX -> 18-decimal base units as a string, without float overflow
const toAdydx = (dydx) => (BigInt(Math.round(dydx * 1e6)) * BigInt(1e12)).toString()

async function addUnbonding(api) {
  for (const owner of DYDX_ADDRESSES) {
    const unbondings = await queryV1Beta1V2({ api, url: `staking/v1beta1/delegators/${owner}/unbonding_delegations`, dataKey: 'unbonding_responses' })
    for (const { entries = [] } of unbondings) for (const { balance } of entries) api.add(ADYDX, balance)
  }
}

async function addLiquid(api) {
  const balances = {}
  for (const owner of DYDX_ADDRESSES) await getBalance2({ balances, owner, chain: 'dydx', tokens: [ADYDX, USDC_IBC] })
  api.add(ADYDX, balances[ADYDX] ?? 0)
  api.add(USDC, (balances[USDC_IBC.replaceAll('/', ':')] ?? 0) / 1e6, { skipChain: true })
}

// ---- exports ----

// Today: everything straight from the LCD.
async function dydxLiveTvl(api) {
  await addLiquid(api)
  await cosmosStaked(api, DYDX_ADDRESSES)
  await addUnbonding(api)
}

// A past date: today's anchor walked back through the Allium deltas, plus the last
// Allium bank snapshot on or before the date, carried forward.
async function dydxHistoricalTvl(api) {
  const day = dayOf(api.timestamp)
  if (day < `${DELTAS_START}-05`) return // mandate not funded yet

  const [anchor, store] = await Promise.all([stakedTodayDydx(), loadPartitions()])
  if (!anchor) throw new Error('kpk dydx: LCD returned no delegations for the anchor; refusing to write a history without its staked leg')

  const months = Object.values(store.months)
  const deltas = months.flatMap((m) => m.deltas || [])
  const balances = months.flatMap((m) => m.balances || [])

  let staked = anchor
  let unbonding = 0
  const unbondingFrom = shiftDay(day, -UNBONDING_DAYS)
  for (const d of deltas) {
    const dDay = String(d.day).slice(0, 10)
    const amount = Number(d.dydx) || 0
    if (dDay > day) staked -= (DELTA_SIGN[d.event_type] ?? 0) * amount
    // an unbond in the trailing window is still the mandate's DYDX, in the queue
    else if (d.event_type === 'unbond' && dDay > unbondingFrom) unbonding += amount
    else if (d.event_type === 'cancel_unbonding_delegation' && dDay > unbondingFrom) unbonding -= amount
  }
  staked = Math.max(0, staked)
  unbonding = Math.max(0, unbonding)
  api.add(ADYDX, toAdydx(staked + unbonding))

  // last observed balance per (address, currency) on or before `day`
  const last = {}
  for (const r of balances) {
    const rDay = String(r.day).slice(0, 10)
    if (rDay > day) continue
    const key = `${r.address}|${r.currency}`
    if (!last[key] || last[key].day < rDay) last[key] = { day: rDay, amount: Number(r.amount) || 0 }
  }
  for (const [key, { amount }] of Object.entries(last)) {
    const currency = key.split('|')[1]
    if (!amount) continue
    if (currency === ADYDX) api.add(ADYDX, toAdydx(amount))
    else if (currency === USDC_IBC) api.add(USDC, amount, { skipChain: true })
  }
}

module.exports = { DYDX_ADDRESSES, dydxLiveTvl, dydxHistoricalTvl }
