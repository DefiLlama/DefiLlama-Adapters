const axios = require('axios')
const { getEnv } = require('../env')

const client = axios.create({
  baseURL: getEnv('RPC_PROXY_URL'),
  timeout: 30000,
})


module.exports = {
  fuel: {
    query: async ({ contractId, abi, method }) => {
      const { data } = await client.post('/fuel/query', { contractId, abi, method })
      return data
    }
  },
  ripple: {
    gatewayBalances: async ({ account, hotwallet }) => {
      const { data } = await client.post('/ripple/gateway_balances', { account, hotwallet })
      return data
    }
  },
  injective: {
    mitoVaultQuery: async ({ address }) => {
      const { data } = await client.get('/injective/mito-vault/' + address)
      return data
    },
    getMarkets: async (body) => {
      const { data } = await client.post('/injective/orderbook/markets', body)
      return data
    },
    getOrders: async (body) => {
      const { data } = await client.post('/injective/orderbook/orders', body)
      return data
    },
  },
  kamino: {
    tvl: async () => {
      const { data } = await client.get('/kamino/tvl')
      return data
    },
  },
}