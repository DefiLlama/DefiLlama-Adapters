
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')
const coreTokensAll = require('../coreAssets.json')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses } = require('../utils')

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

async function getCoinInfo(address) {
  if (address === '0x1') return { data: { decimals: 8, name: 'Aptos' } }
  return http.get(`${endpoint()}/v1/accounts/${address}/resource/0x1::coin::CoinInfo%3C${address}::coin::T%3E`)
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

async function sumTokens({ balances = {}, owners = [] }) {
  owners = getUniqueAddresses(owners, true)
  const resources = await Promise.all(owners.map(getResources))
  resources.flat().filter(i => i.type.includes('::CoinStore')).forEach(i => {
    const token = i.type.split('<')[1].replace('>', '')
    sdk.util.sumSingleBalance(balances, token, i.data.coin.value)
  })
  return transformBalances('aptos', balances)
}

async function getTableData({ table, data }) {
  const response = await http.post(`${endpoint()}/v1/tables/${table}/item`, data)
  return response
}

async function function_view({ functionStr, type_arguments = [], args = [] }) {
  const response = await http.post(`${endpoint()}/v1/view`, { "function": functionStr, "type_arguments": type_arguments, arguments:args })
  return response
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

module.exports = {
  endpoint: endpoint(),
  dexExport,
  aQuery,
  getCoinInfo,
  getResources,
  getResource,
  coreTokens,
  sumTokens,
  getTableData,
  function_view,
  hexToString,
};
