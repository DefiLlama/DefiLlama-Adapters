const axios = require('axios')
const { getEnv } = require('../env')

const client = axios.create({
  baseURL: getEnv('RPC_PROXY_URL'),
  timeout: 30000,
})


module.exports = {
  stellar: {
    tokenBalance: async ({ token, address }) => {
      const { data } = await client.get(`/stellar/token-balance/${token}/${address}`)
      return data
    },
    nativeBalance: async (address) => {
      const { data } = await client.get(`/stellar/balances/${address}`)
      return data
    },
    blendBackstopTvl: async (backstopId) => {
      const { data } = await client.get(`/stellar/blend-get-backstop/${backstopId}`)
      return data
    },
    blendPoolInfo: async (backstopId) => {
      const { data } = await client.get(`/stellar/blend-get-pool-data/${backstopId}`)
      return data
    },
  },
  fuel: {
    query: async ({ contractId, abi, method, params = [] }) => {
      const { data } = await client.post('/fuel/query', { contractId, abi, method, params})
      return data
    }
  },
  ripple: {
    gatewayBalances: async ({ account, hotwallet }) => {
      const { data } = await client.post('/ripple/gateway_balances', { account, hotwallet })
      return data
    }
  },
  drift: {
    vaultTvl: async (vault, version) => {
      const { data } = await client.get('/drift/vault_tvl', { params: { vault, version } })
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
  beacon: {
    balance: async (addresses = []) => {
      const { data } = await client.get('/beacon/total_staked', { params: { withdrawal_credentials: addresses.join(',') } })
      return data.total_balance * 1e9
    },
  },
  sui: {
    query: async ({ target, contractId, typeArguments, sender }) => {
      const { data } = await client.post('/sui/query', { target, contractId, typeArguments, sender })
      return data
    }
  }
}