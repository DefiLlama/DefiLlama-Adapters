const axios = require('axios')

const factory = '0x98e19A533FadB2C9853983772E4e7aa09a1478e0'
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
  // Get pair length using direct RPC call
  const pairLengthData = await makeRPCCall('eth_call', [{
    to: factory,
    data: '0x574f2ba3' // allPairsLength() function selector
  }, 'latest'])
  
  const pairLength = parseInt(pairLengthData, 16)
  
  if (pairLength === 0) {
    return {}
  }
  
  // Get all pair addresses
  const pairs = []
  for (let i = 0; i < pairLength; i++) {
    const indexHex = i.toString(16).padStart(64, '0')
    const pairData = await makeRPCCall('eth_call', [{
      to: factory,
      data: '0x1e3dd18b' + indexHex // allPairs(uint256) function selector + padded index
    }, 'latest'])
    
    if (pairData && pairData !== '0x') {
      pairs.push('0x' + pairData.slice(-40))
    }
  }
  
  const balances = {}
  
  // Get token0 and token1 for each pair and their balances
  for (const pair of pairs) {
    try {
      const [token0Data, token1Data] = await Promise.all([
        makeRPCCall('eth_call', [{
          to: pair,
          data: '0x0dfe1681' // token0() function selector
        }, 'latest']),
        makeRPCCall('eth_call', [{
          to: pair,
          data: '0xd21220a7' // token1() function selector  
        }, 'latest'])
      ])
      
      if (token0Data && token1Data && token0Data !== '0x' && token1Data !== '0x') {
        const token0 = '0x' + token0Data.slice(-40)
        const token1 = '0x' + token1Data.slice(-40)
        
        // Get balances directly using RPC calls
        const token0Balance = await makeRPCCall('eth_call', [{
          to: token0,
          data: '0x70a08231' + pair.slice(2).padStart(64, '0') // balanceOf(pair)
        }, 'latest'])
        
        const token1Balance = await makeRPCCall('eth_call', [{
          to: token1,
          data: '0x70a08231' + pair.slice(2).padStart(64, '0') // balanceOf(pair)
        }, 'latest'])
        
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
      }
    } catch (error) {
      console.log(`Error getting tokens for pair ${pair}:`, error.message)
    }
  }
  
  // Convert balances to the expected format
  Object.keys(balances).forEach(token => {
    api.add(token, balances[token])
  })
  
  return api.getBalances()
}

module.exports = {
    misrepresentedTokens: true,
    hyperliquid: { tvl }
}