const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const coreTokensAll = require('../coreAssets.json')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses } = require('../utils')
const { GraphQLClient } = require("graphql-request");

const coreTokens = Object.values(coreTokensAll.aptos)

const endpoint = () => getEnv('APTOS_RPC')

async function aQuery(api) {
  return http.get(`${endpoint()}${api}`)
}

async function getResources(account) {
  const data = []
  let lastData
  let cursor
  do {
    let url = `${endpoint()}/v1/accounts/${account}/resources?limit=9999`
    if (cursor) url += '&start=' + cursor
    const res = await http.getWithMetadata(url)
    lastData = res.data
    data.push(...lastData)
    sdk.log('fetched resource length', lastData.length)
    cursor = res.headers['x-aptos-cursor']
  } while (lastData.length === 9999)
  return data
}

async function getResource(account, key) {
  let url = `${endpoint()}/v1/accounts/${account}/resource/${key}`
  const { data } = await http.get(url)
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
      tvl: async () => {
        const balances = {}
        let pools = await getResources(account)
        pools = pools.filter(i => i.type.includes(poolStr))
        log(`Number of pools: ${pools.length}`)
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

        return transformBalances('aptos', balances)
      }
    }
  }
}

async function sumTokens({ balances = {}, owners = [], blacklistedTokens = [], tokens = [] }) {
  owners = getUniqueAddresses(owners, true)
  const resources = await Promise.all(owners.map(getResources))
  resources.flat().filter(i => i.type.includes('::CoinStore')).forEach(i => {
    const token = i.type.split('<')[1].replace('>', '')
    if (tokens.length && !tokens.includes(token)) return;
    if (blacklistedTokens.includes(token)) return;
    sdk.util.sumSingleBalance(balances, token, i.data.coin.value)
  })
  return transformBalances('aptos', balances)
}

async function getTableData({ table, data }) {
  const response = await http.post(`${endpoint()}/v1/tables/${table}/item`, data)
  return response
}

async function function_view({ functionStr, type_arguments = [], args = [], ledgerVersion = undefined }) {
  let path = `${endpoint()}/v1/view`
  if (ledgerVersion !== undefined) path += `?ledger_version=${ledgerVersion}`
  const response = await http.post(path, { "function": functionStr, "type_arguments": type_arguments, arguments: args })
  return response.length === 1 ? response[0] : response
}

function hexToString(hexString) {
  if (hexString.startsWith('0x')) hexString = hexString.slice(2);
  const byteLength = hexString.length / 2;
  const byteArray = new Uint8Array(byteLength);

  for (let i = 0; i < byteLength; i++) {
    const hexByte = hexString.substr(i * 2, 2);
    byteArray[i] = parseInt(hexByte, 16);
  }

  const decoder = new TextDecoder('utf-8');
  const stringValue = decoder.decode(byteArray);

  return stringValue
}

function sumTokensExport(options) {
  return async (api) => sumTokens({ ...api, api, ...options })
}

const VERSION_GROUPING = 1000000

// If I can get this timestampQuery to work... everything will work seamlessly
async function timestampToVersion(timestamp, start_version = 1962588495, end_version = 1962588495 + VERSION_GROUPING) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let closestTransactions = await findClosestTransaction(timestamp, start_version, end_version)
    if (closestTransactions.length < 1) {
      start_version += VERSION_GROUPING
      end_version += VERSION_GROUPING
    } else {
      return closestTransactions[0].version
    }
  }
}

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql")
const timestampQuery = `query TimestampToVersion($timestamp: timestamp, $start_version: bigint, $end_version: bigint) {
block_metadata_transactions(
  where: {timestamp: {_gte: $timestamp }, version: {_gte: $start_version, _lte: $end_version}}
  limit: 1
  order_by: {version: asc}
) {
    timestamp
    version
  }
}`;
async function findClosestTransaction(timestamp, start_version, end_version) {
  let date = new Date(timestamp * 1000).toISOString()

  const results = await graphQLClient.request(
    timestampQuery,
    {
      timestamp: date,
      start_version,
      end_version,
    }
  )

  return results.block_metadata_transactions
}

module.exports = {
  endpoint: endpoint(),
  dexExport,
  aQuery,
  getResources,
  getResource,
  coreTokens,
  sumTokens,
  sumTokensExport,
  getTableData,
  function_view,
  hexToString,
  timestampToVersion
};
