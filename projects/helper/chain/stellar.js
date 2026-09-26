// Horizon / Soroban transport and the StrKey / XDR / ScVal codec live in @defillama/sdk (`sdk.chains.stellar`);
// this file keeps the TVL helpers (sumTokens, addUSDCBalance) and the historical export shapes.
const { get } = require('../http')
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

async function addUSDCBalance(api, account) {
  const { balances } = await get(`https://api.stellar.expert/explorer/public/contract/${account}/value`)
  const usdc = balances.find(({ asset }) => asset === 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1')
  if (usdc) {
    api.addCGToken('usd-coin', usdc.value / 1e7)
  }
}


async function sumTokens(config) {
  const { api, owners = [], owner, ...rest } = config
  if (owners?.length) {
    for (const owner of owners)
      await sumTokens({ ...rest, owner, api, skiTransform: true })
    return transformBalances(api.chain, api.getBalances())
  } else {
    const { balances } = await get(`https://api.stellar.expert/explorer/public/account/${owner}/value`)
    // `balance` is the raw on-chain amount (7 decimals); `value` is a USD estimate and must not be used as a balance
    balances.forEach(({ asset, balance }) => {
      api.add(asset, balance)
    })
  }
  if (config.skiTransform) return api.getBalances()
  return transformBalances(api.chain, api.getBalances())

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
  getTokenBalance,
  decodeStrKey,
  callSoroban,
  getContractInstanceStorage,
  parseScVal,
  SOROBAN_RPC_URL,
}
