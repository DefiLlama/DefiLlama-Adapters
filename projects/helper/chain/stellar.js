// Horizon / Soroban transport and the StrKey / XDR / ScVal codec live in @defillama/sdk (`sdk.chains.stellar`);
// this file keeps the TVL helpers (sumTokens, addUSDCBalance) and the historical export shapes.
const { transformBalances } = require('../portedTokens')
const { stellar } = require('@defillama/sdk').chains

const SOROBAN_RPC_URL = stellar.getSorobanEndpoints()[0]

// authorized + authorized_to_maintain_liabilities trustline balances (Horizon display units, 7 decimals)
async function getAssetSupply(asset) {
  const [assetCode, assetIssuer] = asset.split('-')
  const record = await stellar.getAsset({ code: assetCode, issuer: assetIssuer })
  let supply = 0
  if (record) {
    supply += +record.balances.authorized
    supply += +record.balances.authorized_to_maintain_liabilities
  }
  return supply
}

const USDC = 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'

// USDC held by a Soroban contract (read through the asset's SAC)
async function addUSDCBalance(api, account) {
  const raw = await stellar.getTokenBalance({ asset: USDC, address: account })
  api.add(`${USDC}-1`, raw)
}

// balance key in the format the coins server prices: `XLM` for the native asset,
// `CODE-ISSUER-1` (alphanum4) / `CODE-ISSUER-2` (alphanum12) for trustlines, pool shares are skipped
function balanceKey({ asset, assetType, code, issuer }) {
  if (assetType === 'native') return 'XLM'
  if (assetType === 'credit_alphanum4') return `${code}-${issuer}-1`
  if (assetType === 'credit_alphanum12') return `${code}-${issuer}-2`
  return null
}

// classic account balances via Horizon; an account that was never funded is logged and skipped
async function sumTokens(config) {
  const { api, owners = [], owner, ...rest } = config
  if (owners?.length) {
    for (const owner of owners)
      await sumTokens({ ...rest, owner, api, skiTransform: true })
    return transformBalances(api.chain, api.getBalances())
  } else {
    const balances = await stellar.getAccountBalances({ address: owner })
    if (!balances.length) console.log(`[stellar] account ${owner} not found on-chain, skipping`)
    for (const bal of balances) {
      const key = balanceKey(bal)
      if (key) api.add(key, bal.raw)
    }
  }
  if (config.skiTransform) return api.getBalances()
  return transformBalances(api.chain, api.getBalances())
}

/**
 * Events emitted by a contract within the Soroban RPC retention window (~7 days on the public RPCs), oldest first.
 * `topic` keeps only events whose first topic symbol matches. Each event carries decoded `topics` and `data` (the event value).
 * Full history is not available from the RPC: persist what this returns (see sushi-stellar, blend-pools-v2).
 */
async function getContractEvents({ contractId, topic, lookbackLedgers = 100_000, limit = 200 }) {
  const latest = await stellar.getLatestSorobanLedger()
  const filters = [{ type: 'contract', contractIds: [contractId] }]
  let params = { startLedger: Math.max(1, latest.number - lookbackLedgers), filters, pagination: { limit } }
  const events = []
  while (true) {
    const res = await stellar.sorobanRpc('getEvents', params)
    const page = res.events ?? []
    for (const ev of page) {
      const topics = ev.topic.map(t => stellar.parseScVal(t))
      if (topic && topics[0] !== topic) continue
      events.push({ ...ev, topics, data: stellar.parseScVal(ev.value) })
    }
    if (page.length < limit) break
    params = { filters, pagination: { limit, cursor: res.cursor } }
  }
  return events
}

/**
 * Read the "balance" function of a token for a given address
 * @param {string} token
 * @param {string} address
 * @returns {Promise<bigint>}
 */
async function getTokenBalance(token, address) {
  return callSoroban(token, 'balance', [address])
}

/** raw payload bytes of a StrKey (version byte and checksum stripped) */
function decodeStrKey(strKey) {
  return stellar.strKeyToBytes(strKey)
}

/**
 * Simulate a read-only Soroban contract call via RPC.
 * @param {string} contractId  - Stellar contract address
 * @param {string} fnName      - Contract function name
 * @param {Array}  args        - Function args. Defaults `G...` strings to ACCOUNT, `C...` strings to ADDRESS and numbers to U32
 * For other arg types, pass an object like: { type: 'u128', value: 100n } or { type: 'bool', value: true }
 * For a #[contracttype] struct arg, pass { type: 'map', value: { field: { type, value }, ... } }
 *   e.g. HubAssetKey { hub_id: u32, asset: Address } ->
 *        { type: 'map', value: { hub_id: { type: 'u32', value: 1 }, asset: { type: 'address', value: 'C...' } } }
 * Returns the decoded ScVal (i128 / u64 -> bigint, addresses -> StrKey, vec -> array, map -> object)
 */
async function callSoroban(contractId, fnName, args = []) {
  return stellar.callSoroban({ contractId, method: fnName, args })
}

/** Read a contract's instance storage via the Soroban RPC's `getLedgerEntries`
 * @param {string} contractId  - Stellar contract address
 * Serves as a "method to access your contract data which may not be available via events or simulateTransaction" (callSoroban): https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgerEntries
*/
async function getContractInstanceStorage(contractId) {
  return stellar.getContractInstanceStorage({ contractId })
}

/** Parse one ScVal at `offset` of raw XDR bytes -> { value, offset: position after the value } */
function parseScVal(buf, offset = 0) {
  const reader = new stellar.XdrReader(buf, offset)
  const value = stellar.readScVal(reader)
  return { value, offset: reader.offset }
}

module.exports = {
  getAssetSupply,
  addUSDCBalance,
  sumTokens,
  getContractEvents,
  getTokenBalance,
  decodeStrKey,
  callSoroban,
  getContractInstanceStorage,
  parseScVal,
  SOROBAN_RPC_URL,
}
