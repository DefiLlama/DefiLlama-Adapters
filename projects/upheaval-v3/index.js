const { cachedGraphQuery } = require('../helper/cache')
const axios = require('axios')

const RPC_URL = 'https://rpc.hyperliquid.xyz/evm'

async function makeRPCCall(method, params = []) {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1
  })
  
  if (response.data.error) {
    throw new Error(`RPC Error: ${response.data.error.message}`)
  }
  
  return response.data.result
}

async function tvl(api) {
  // This is PCS forked v3 subgraph. We can use it to get TVL of all pools.
  const { pools } = await cachedGraphQuery('upheaval-v3/' + api.chain, 'https://api.upheaval.fi/subgraphs/name/upheaval/exchange-v3', `{
    pools(first: 1000) {
      id
      totalValueLockedUSD
    }
  }`)

  let totalTVL = 0
  for (const pool of pools) {
    totalTVL += parseFloat(pool.totalValueLockedUSD)
  }
  return { 'usd-coin': totalTVL }
}

module.exports = {
    misrepresentedTokens: true,
    hyperliquid: { tvl }
}