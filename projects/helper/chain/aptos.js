
const sdk = require('@defillama/sdk')

const http = require('../http')
const { fixBalancesTokens } = require('../tokenMapping')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses } = require('../utils')

const coreTokens = Object.keys(fixBalancesTokens.aptos)

const endpoint = process.env.APTOS_RPC || "https://aptos-mainnet.pontem.network"

async function aQuery(api) {
  return http.get(`${endpoint}${api}`)
}
async function getResources(account) {
  return http.get(`${endpoint}/v1/accounts/${account}/resources`)
}
async function getCoinInfo(address) {
  if (address === '0x1') return { data: { decimals: 8, name: 'Aptos' } }
  return http.get(`${endpoint}/v1/accounts/${address}/resource/0x1::coin::CoinInfo%3C${address}::coin::T%3E`)
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

module.exports = {
  endpoint,
  dexExport,
  aQuery,
  getCoinInfo,
  getResources,
  coreTokens,
  sumTokens,
};
