const https = require('https')

/**
 * Zenchain precompile contract addresses
 * Documentation: https://docs.zenchain.io/docs/build-on-zenchain/precompiled-smart-contracts
 */
const NATIVE_STAKING_PRECOMPILE = '0x0000000000000000000000000000000000000800'

/**
 * Query Zenchain RPC endpoint with single request
 * @param {string} method - RPC method name
 * @param {Array} params - Method parameters
 * @returns {Promise<Object>} RPC response
 */
async function queryRPC(method, params = []) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    })
    
    const options = {
      hostname: 'zenchain-testnet.api.onfinality.io',
      path: '/public',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve(result)
        } catch {
          resolve(null)
        }
      })
    })
    
    req.on('error', () => resolve(null))
    req.write(postData)
    req.end()
  })
}

/**
 * Batch query multiple RPC calls efficiently
 * @param {Array} requests - Array of {method, params} objects
 * @returns {Promise<Array>} Array of RPC responses
 */
async function batchQueryRPC(requests) {
  return new Promise((resolve) => {
    const batchRequest = requests.map((req, index) => ({
      jsonrpc: '2.0',
      method: req.method,
      params: req.params,
      id: index + 1
    }))
    
    const postData = JSON.stringify(batchRequest)
    
    const options = {
      hostname: 'zenchain-testnet.api.onfinality.io',
      path: '/public',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const results = JSON.parse(data)
          resolve(Array.isArray(results) ? results : [results])
        } catch {
          resolve(requests.map(() => null))
        }
      })
    })
    
    req.on('error', () => resolve(requests.map(() => null)))
    req.write(postData)
    req.end()
  })
}


/**
 * Get staking TVL for Zenchain
 * 
 * Queries the NativeStaking precompile (0x800) for accurate staking data:
 * 1. Gets current era from currentEra()
 * 2. Gets actual total staked amount using erasTotalStake(era)
 * 3. Falls back to estimation using idealValidatorCount × minValidatorBond
 * 
 * @param {Object} api - DefiLlama SDK API object
 * @returns {Promise<Object>} Balance object with staked ZTC
 */
async function staking(api) {
  try {
    // Step 1: Get current era first (required for erasTotalStake)
    const currentEraResult = await queryRPC('eth_call', [{
      to: NATIVE_STAKING_PRECOMPILE,
      data: '0x973628f6' // currentEra()
    }, 'latest'])
    
    const currentEra = currentEraResult?.result ? parseInt(currentEraResult.result, 16) : null
    
    if (!currentEra && currentEra !== 0) {
      return api.getBalances()
    }
    
    // Step 2: Get ACTUAL total staked for current era using erasTotalStake
    const eraHex = currentEra.toString(16).padStart(64, '0')
    const erasTotalStakeData = '0x0b1323bc' + eraHex // erasTotalStake(uint32) + era parameter
    
    const totalStakeResult = await queryRPC('eth_call', [{
      to: NATIVE_STAKING_PRECOMPILE,
      data: erasTotalStakeData
    }, 'latest'])
    
    if (!totalStakeResult?.result || totalStakeResult.result === '0x') {
      return fallbackToEstimation(api)
    }
    
    // Step 3: Calculate actual TVL from erasTotalStake result
    const actualTotalStaked = BigInt(totalStakeResult.result)
    
    // Add actual staked amount to DefiLlama API
    api.addGasToken(actualTotalStaked.toString())
    
    return api.getBalances()
    
  } catch (error) {
    return fallbackToEstimation(api)
  }
}

/**
 * Fallback estimation method using validator count × minimum bond
 * @param {Object} api - DefiLlama SDK API object
 * @returns {Promise<Object>} Balance object with estimated staked ZTC
 */
async function fallbackToEstimation(api) {
  try {
    const batchRequests = [
      {
        method: 'eth_call',
        params: [{ to: NATIVE_STAKING_PRECOMPILE, data: '0x8571bd93' }, 'latest'] // idealValidatorCount()
      },
      {
        method: 'eth_call',
        params: [{ to: NATIVE_STAKING_PRECOMPILE, data: '0xc28615a3' }, 'latest'] // minValidatorBond()
      }
    ]
    
    const results = await batchQueryRPC(batchRequests)
    const [idealCountResult, minBondResult] = results
    
    const idealValidatorCount = idealCountResult?.result ? parseInt(idealCountResult.result, 16) : 0
    const minValidatorBond = minBondResult?.result ? BigInt(minBondResult.result) : BigInt(0)
    
    if (idealValidatorCount > 0 && minValidatorBond > 0n) {
      const estimatedTotalStaked = BigInt(idealValidatorCount) * minValidatorBond
      api.addGasToken(estimatedTotalStaked.toString())
    }
    
    return api.getBalances()
  } catch (error) {
    return api.getBalances()
  }
}

/**
 * Get TVL for Zenchain (non-staking assets)
 * Tracks DeFi protocol deposits, DEX liquidity, and bridged assets
 * 
 * @param {Object} api - DefiLlama SDK API object
 * @returns {Promise<Object>} Balance object with protocol TVL
 */
async function tvl(api) {
  // TODO: Add protocol-specific TVL tracking as protocols deploy
  return api.getBalances()
}

module.exports = {
  methodology: "Tracks staking TVL by querying the NativeStaking precompile (0x800) using erasTotalStake(currentEra) to get actual total staked amounts per era. Uses Keccak-256 function selectors for precompile calls. Falls back to estimation method (idealValidatorCount × minValidatorBond) if direct query fails.",
  start: 1704067200,
  zenchain_testnet: {
    tvl,
    staking,
  },
}