// XRP Ledger Single Asset Vaults (XLS-65) and Lending Protocol (XLS-66). Both are ledger features, not contracts:
// every vault, loan broker and loan is a ledger object, so the whole market is read from the ledger itself.
//
//  - Vault:      Asset, AssetsTotal, AssetsAvailable (what the vault's pseudo-account holds right now)
//  - LoanBroker: VaultID, CoverAvailable (first-loss capital held by the broker's pseudo-account), DebtTotal
//  - Loan:       LoanBrokerID, PrincipalOutstanding
//
// tvl      = AssetsAvailable of every vault + CoverAvailable of every loan broker
// borrowed = PrincipalOutstanding of every loan
//
// Objects are listed with ledger_data filtered by type at one pinned validated ledger. A rippled node answers a full
// type-filtered walk in about 200 pages; the public Clio nodes (s1/s2.ripple.com) need thousands, so the walk uses
// xrplcluster.com unless XRPL_WHITELISTED_RPC names other nodes. Three walks per run, so it runs in the custom-scripts
// runner (helper/custom-scripts/sushi-analytics-v2, bulky group) and ./index.js reads the stored result.
// Test with: node test.js projects/xrpl-lending/api.js
const axios = require('axios')

const PROJECT = 'xrpl-lending'
const DEFAULT_ENDPOINTS = ['https://xrplcluster.com']
const LEDGER_LAG = 10
const PAGE_LIMIT = 100000 // the node caps it; a rippled page covers about 0.5% of the state
const MAX_ATTEMPTS = 8
const RLUSD = '524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
// coins-server decimals for issued currencies that are not stored as 0, see helper/sumTokens.js
const TOKEN_DECIMALS = { [RLUSD]: 6 }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const getEndpoints = () => (process.env.XRPL_WHITELISTED_RPC ?? '').split(',').map((s) => s.trim()).filter(Boolean)

// one JSON-RPC call; rate limits and network errors are retried on the next endpoint, ledger errors are thrown
async function rpc(endpoints, method, params) {
  let lastError
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const url = endpoints[attempt % endpoints.length]
    try {
      const { data } = await axios.post(url, { method, params: [params] }, { timeout: 60_000 })
      const result = data?.result
      if (result?.status === 'success') return result
      lastError = new Error(`${method} on ${url}: ${result?.error} ${result?.error_message ?? ''}`)
      if (!/tooBusy|slowDown|rate ?limit|quota|noNetwork|noCurrent/i.test(lastError.message)) throw lastError
    } catch (e) {
      if (e === lastError) throw e
      lastError = e
    }
    await sleep(5_000 * (attempt + 1))
  }
  throw lastError
}

// every ledger object of one type at the pinned ledger (markers are ledger keys, so they carry across nodes)
async function listObjects(endpoints, type, ledgerIndex) {
  const objects = []
  let marker
  let pages = 0
  do {
    const params = { ledger_index: ledgerIndex, type, limit: PAGE_LIMIT, binary: false }
    if (marker) params.marker = marker
    const result = await rpc(endpoints, 'ledger_data', params)
    objects.push(...(result.state ?? []))
    marker = result.marker
    pages++
  } while (marker)
  console.log(`${PROJECT}: ${objects.length} ${type} objects in ${pages} pages at ledger ${ledgerIndex}`)
  return objects
}

let snapshot // tvl and borrowed run as separate jobs in the same process and share one read
function getSnapshot() {
  if (!snapshot) snapshot = (async () => {
    const configured = getEndpoints()
    const endpoints = configured.length ? configured : DEFAULT_ENDPOINTS
    const latest = await rpc(endpoints, 'ledger', { ledger_index: 'validated' })
    const ledgerIndex = Number(latest.ledger_index) - LEDGER_LAG
    const vaults = await listObjects(endpoints, 'vault', ledgerIndex)
    const brokers = await listObjects(endpoints, 'loan_broker', ledgerIndex)
    const loans = await listObjects(endpoints, 'loan', ledgerIndex)
    return {
      ledgerIndex,
      vaults: Object.fromEntries(vaults.map((v) => [v.index, v])),
      brokers: Object.fromEntries(brokers.map((b) => [b.index, b])),
      loans,
    }
  })().catch((e) => { snapshot = undefined; throw e })
  return snapshot
}

// vault amounts: XRP in drops, issued currencies as decimal strings, MPTs in the issuance's base units
function addAsset(api, asset, amount) {
  amount = Number(amount ?? 0) // a field the ledger omits is 0
  if (!asset || !(amount > 0)) return
  if (asset.mpt_issuance_id) return api.add(`MPT.${asset.mpt_issuance_id}`, amount)
  if (asset.currency === 'XRP' && !asset.issuer) return api.addCGToken('ripple', amount / 1e6)
  const token = `${asset.currency}.${asset.issuer}`
  api.add(token, amount * 10 ** (TOKEN_DECIMALS[token] ?? 0))
}

async function tvl(api) {
  const { vaults, brokers } = await getSnapshot()
  Object.values(vaults).forEach((vault) => addAsset(api, vault.Asset, vault.AssetsAvailable))
  Object.values(brokers).forEach((broker) => addAsset(api, vaults[broker.VaultID]?.Asset, broker.CoverAvailable))
  return api.getBalances() // the custom-scripts runner stores what tvl returns
}

async function borrowed(api) {
  const { vaults, brokers, loans } = await getSnapshot()
  loans.forEach((loan) => addAsset(api, vaults[brokers[loan.LoanBrokerID]?.VaultID]?.Asset, loan.PrincipalOutstanding))
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  ripple: { tvl, borrowed },
}
