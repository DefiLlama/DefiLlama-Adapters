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
  const { pools } = await cachedGraphQuery('upheaval-v3/' + api.chain, 'https://api.upheaval.fi/subgraphs/name/upheaval/exchange-v3', `{
    pools(first: 1000) {
      id
      token0 {
        id
      }
      token1 {
        id
      }
    }
  }`)
  
  console.log(`Found ${pools.length} pools from subgraph`)
  
  const balances = {}
  
  // Process each pool and get token balances manually
  for (const pool of pools) {
    try {
      const token0 = pool.token0.id
      const token1 = pool.token1.id
      const poolAddress = pool.id
      
      // Get token balances in the pool using direct RPC calls
      const [token0Balance, token1Balance] = await Promise.all([
        makeRPCCall('eth_call', [{
          to: token0,
          data: '0x70a08231' + poolAddress.slice(2).padStart(64, '0') // balanceOf(pool)
        }, 'latest']),
        makeRPCCall('eth_call', [{
          to: token1,
          data: '0x70a08231' + poolAddress.slice(2).padStart(64, '0') // balanceOf(pool)
        }, 'latest'])
      ])
      
      if (token0Balance && token0Balance !== '0x') {
        const balance0 = parseInt(token0Balance, 16)
        if (balance0 > 0) {
          balances[token0] = (balances[token0] || 0) + balance0
        }
      }
      
      if (token1Balance && token1Balance !== '0x') {
        const balance1 = parseInt(token1Balance, 16)
        if (balance1 > 0) {
          balances[token1] = (balances[token1] || 0) + balance1
        }
      }
    } catch (error) {
      console.log(`Error processing pool ${pool.id}:`, error.message)
    }
  }
  
  // Add balances to API
  Object.keys(balances).forEach(token => {
    api.add(token, balances[token])
  })
  
  return api.getBalances()
}

module.exports = {
    misrepresentedTokens: true,
    hyperliquid: { tvl }
}