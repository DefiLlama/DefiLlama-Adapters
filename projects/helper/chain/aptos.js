const sdk = require('@defillama/sdk')

const coreTokensAll = require('../coreAssets.json')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses, sliceIntoChunks } = require('../utils')
const { GraphQLClient } = require("graphql-request");

const aptos = sdk.chains.aptos

const endpoint = () => aptos.getEndpoint({ chain: 'aptos' })
const movementEndpoint = () => aptos.getEndpoint({ chain: 'move' })

const endpointMap = {
  aptos: endpoint,
  move: movementEndpoint,
}

// raw GET against the node, `api` is the path (e.g. `/v1/accounts/0x1/resources`)
async function aQuery(api, chain = 'aptos') {
  return aptos.get({ chain, path: api })
}

async function getResources(account, chain = 'aptos') {
  return aptos.getResources({ chain, account })
}

async function getResource(account, key, chain = 'aptos') {
  if (typeof chain !== 'string') chain = 'aptos'
  const data = await aptos.getResource({ chain, account, type: key })
  if (data === null || data === undefined) throw new Error(`Failed to get resource ${key} of ${account} on ${chain}`)
  return data
}

function dexExport({
  account,
  poolStr,
  token0Reserve = i => i.data.coin_x_reserve.value,
  token1Reserve = i => i.data.coin_y_reserve.value,
  getTokens = i => i.type.split('<')[1].replace('>', '').split(', '),
}) {
  return {
    timetravel: false,
    misrepresentedTokens: true,
    aptos: {
      tvl: async (api) => {
        const chain = api.chain
        const balances = {}
        let pools = await getResources(account, chain)
        pools = pools.filter(i => i.type.includes(poolStr))
        log(`Number of pools: ${pools.length}`)
        const coreTokens = Object.values(coreTokensAll[chain] ?? {})
        pools.forEach(i => {
          const reserve0 = token0Reserve(i)
          const reserve1 = token1Reserve(i)
          const [token0, token1] = getTokens(i)
          const isCoreAsset0 = coreTokens.includes(token0)
          const isCoreAsset1 = coreTokens.includes(token1)
          const nonNeglibleReserves = reserve0 !== '0' && reserve1 !== '0'

          if (isCoreAsset0 && isCoreAsset1) {
            sdk.util.sumSingleBalance(balances, token0, reserve0)
            sdk.util.sumSingleBalance(balances, token1, reserve1)
          } else if (isCoreAsset0) {
            sdk.util.sumSingleBalance(balances, token0, reserve0)
            if (nonNeglibleReserves)
              sdk.util.sumSingleBalance(balances, token0, reserve0)
          } else if (isCoreAsset1) {
            sdk.util.sumSingleBalance(balances, token1, reserve1)
            if (nonNeglibleReserves)
              sdk.util.sumSingleBalance(balances, token1, reserve1)
          }
        })

        return transformBalances(chain, balances)
      }
    }
  }
}

// `/v1/accounts/{account}/balance/{token}` (coin type or fungible asset address)
async function getBalance(account, token, chain = 'aptos') {
  return aptos.get({ chain, path: `/v1/accounts/${account}/balance/${token}` })
}

const FA_BALANCES_QUERY = `query SumTokensFaBalances($addresses: [String!]!) {
  current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }) {
    amount
    asset_type
  }
}`

async function sumTokens({ balances = {}, owners = [], blacklistedTokens = [], tokens = [], api, chain = 'aptos' }) {
  if (api) chain = api.chain
  const uniqueOwners = getUniqueAddresses(owners, true)
  const validTokens = tokens.filter(token => !blacklistedTokens.includes(token));

  // On aptos the indexer's `current_fungible_asset_balances` view returns balances for many owners in
  // a single query (asset_type is the coin type for coin-standard assets, matching the REST /balance result),
  // so we avoid the O(owners * tokens) per-call REST loop. Other chains (e.g. movement) have no such indexer.
  if (chain === 'aptos') {
    const tokenSet = new Set(validTokens)
    for (const ownerChunk of sliceIntoChunks(uniqueOwners, 50)) {
      const { current_fungible_asset_balances: rows } = await graphQLClient.request(FA_BALANCES_QUERY, { addresses: ownerChunk })
      rows.forEach(({ amount, asset_type }) => {
        if (!tokenSet.has(asset_type)) return;
        sdk.util.sumSingleBalance(balances, asset_type, amount);
      })
    }
    return transformBalances(chain, balances)
  }

  for (const owner of uniqueOwners) {
    const balancesPerToken = await Promise.all(
        validTokens.map(token => getBalance(owner, token))
    );

    validTokens.forEach((token, index) => {
      sdk.util.sumSingleBalance(balances, token, balancesPerToken[index]);
    });
  }

  return transformBalances(chain, balances)
}

// POST `/v1/tables/{table}/item` with the raw `{ key_type, value_type, key }` body
async function getTableData({ table, data, chain = 'aptos' }) {
  return aptos.post({ chain, path: `/v1/tables/${table}/item`, body: data })
}

async function function_view({ functionStr, type_arguments = [], args = [], ledgerVersion = undefined, chain = 'aptos' }) {
  const response = await aptos.view({ chain, function: functionStr, typeArguments: type_arguments, args, ledgerVersion })
  return response.length === 1 ? response[0] : response
}

function hexToString(hexString) {
  return aptos.hexToString(hexString)
}

function sumTokensExport(options) {
  return async (api) => sumTokens({ ...api, api, ...options })
}

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");

// Given a timestamp (Date or unix seconds), returns the last ledger version at or before it.
const timestampToVersion = async (timestamp, minBlock = 0, chain = 'aptos') => {
  if (chain !== 'aptos') throw new Error('Unsupported chain');
  const seconds = timestamp instanceof Date ? Math.floor(timestamp.getTime() / 1000) : Number(timestamp)
  return aptos.getVersionAtTimestamp({ chain, timestamp: seconds, minBlock })
}

module.exports = {
  endpoint: endpoint(),
  endpointMap,
  dexExport,
  aQuery,
  getResources,
  getResource,
  coreTokensAptos: Object.values(coreTokensAll['aptos']),
  sumTokens,
  sumTokensExport,
  getTableData,
  function_view,
  hexToString,
  timestampToVersion
};
