const https = require('https')

/**
 * Error handling utility for precompile debugging
 */
function parsePrecompileError(error) {
  if (!error) return 'Unknown error occurred'
  
  const errorMsg = error.message || error.toString()
  const errorData = error.data
  
  let details = {
    message: errorMsg,
    code: error.code || 'Unknown',
    data: errorData
  }
  
  // Decode standard Solidity Error(string) format
  if (errorData && errorData.startsWith && errorData.startsWith('0x08c379a0')) {
    try {
      const dataWithoutPrefix = errorData.slice(10)
      const length = parseInt(dataWithoutPrefix.slice(64, 128), 16)
      const stringHex = dataWithoutPrefix.slice(128, 128 + (length * 2))
      const decodedMessage = Buffer.from(stringHex, 'hex').toString('utf8')
      details.decodedError = decodedMessage
    } catch (e) {
      details.decodeError = e.message
    }
  }
  
  return details
}

/**
 * Zenchain staking precompile contract address
 * Documentation: https://docs.zenchain.io/docs/build-on-zenchain/precompiled-smart-contracts
 */
const STAKING_PRECOMPILE = '0x0000000000000000000000000000000000000800'

/**
 * Query Zenchain RPC endpoint
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
 * Get staking TVL for Zenchain testnet
 * 
 * Attempts to get real-time staking data from NativeStaking precompile.
 * If precompile is not implemented, throws detailed error information for debugging.
 * 
 * Interface reference: https://github.com/zenchain-protocol/precompile-interfaces/blob/main/INativeStaking.sol
 * 
 * @param {Object} api - DefiLlama SDK API object
 * @returns {Promise<Object>} Balance object with staked ZTC
 * @throws {Error} Detailed error information if precompile calls fail
 */
async function staking(api) {
  console.log('=== ZENCHAIN STAKING PRECOMPILE DEBUGGING ===')
  console.log(`Precompile address: ${STAKING_PRECOMPILE}`)
  console.log(`Interface: https://github.com/zenchain-protocol/precompile-interfaces/blob/main/INativeStaking.sol`)
  console.log('')
  
  // Check if precompile has any code deployed
  console.log('1. Checking precompile deployment status...')
  try {
    const codeResult = await queryRPC('eth_getCode', [STAKING_PRECOMPILE, 'latest'])
    if (codeResult?.result) {
      console.log(`   Code at address: ${codeResult.result}`)
      if (codeResult.result !== '0x' && codeResult.result.length > 2) {
        const hex = codeResult.result.slice(2)
        const ascii = Buffer.from(hex, 'hex').toString('ascii')
        console.log(`   Decoded as ASCII: "${ascii}"`)
        
        if (ascii === 'Unizen') {
          console.log('   ⚠️  WARNING: Precompile contains placeholder code')
        }
      } else {
        console.log('   ⚠️  WARNING: No code deployed at precompile address')
      }
    }
  } catch (e) {
    console.log(`   ERROR checking code: ${e.message}`)
  }
  console.log('')
  
  // Test core NativeStaking interface functions
  console.log('2. Testing NativeStaking interface functions...')
  const nativeStakingFunctions = [
    { name: 'currentEra()', selector: '0x359877a6', critical: true },
    { name: 'idealValidatorCount()', selector: '0x130218e5', critical: false },
    { name: 'minValidatorBond()', selector: '0x1fe520d2', critical: false }
  ]
  
  const errors = []
  let successfulCalls = 0
  
  for (const func of nativeStakingFunctions) {
    console.log(`   Testing ${func.name} (selector: ${func.selector})...`)
    
    try {
      const result = await queryRPC('eth_call', [{
        to: STAKING_PRECOMPILE,
        data: func.selector,
        gas: '0x100000'
      }, 'latest'])
      
      if (result?.result && !result?.error && result.result !== '0x') {
        console.log(`   ✅ SUCCESS: ${result.result}`)
        successfulCalls++
        
        // Process successful results
        if (func.name === 'currentEra()') {
          const currentEra = parseInt(result.result, 16)
          console.log(`      Current era: ${currentEra}`)
          
          // Try to get staking data for current era
          console.log(`   Attempting to get era staking data...`)
          // This would be the next step once currentEra() works
        }
        
      } else if (result?.error) {
        const errorDetails = parsePrecompileError(result.error)
        console.log(`   ❌ FAILED: ${errorDetails.decodedError || errorDetails.message}`)
        console.log(`      Error code: ${errorDetails.code}`)
        console.log(`      Raw data: ${errorDetails.data}`)
        
        errors.push({
          function: func.name,
          selector: func.selector,
          critical: func.critical,
          error: errorDetails
        })
      } else {
        console.log(`   ❌ FAILED: No result returned`)
        errors.push({
          function: func.name,
          selector: func.selector,
          critical: func.critical,
          error: { message: 'No result returned', data: result }
        })
      }
    } catch (callError) {
      console.log(`   ❌ EXCEPTION: ${callError.message}`)
      console.log(`      Stack: ${callError.stack}`)
      errors.push({
        function: func.name,
        selector: func.selector,
        critical: func.critical,
        error: { message: callError.message, stack: callError.stack }
      })
    }
  }
  
  console.log('')
  console.log('3. Summary:')
  console.log(`   Successful calls: ${successfulCalls}/${nativeStakingFunctions.length}`)
  console.log(`   Failed calls: ${errors.length}`)
  console.log('')
  
  if (successfulCalls === 0) {
    console.log('=== PRECOMPILE FAILURE ANALYSIS ===')
    console.log('No precompile functions are working. Detailed error report:')
    console.log('')
    
    errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.function} (${err.critical ? 'CRITICAL' : 'optional'})`)
      console.log(`   Selector: ${err.selector}`)
      console.log(`   Error: ${err.error.decodedError || err.error.message}`)
      if (err.error.code) {
        console.log(`   Code: ${err.error.code}`)
      }
      if (err.error.data) {
        console.log(`   Data: ${err.error.data}`)
      }
      if (err.error.stack) {
        console.log(`   Stack: ${err.error.stack}`)
      }
      console.log('')
    })
    
    console.log('RECOMMENDATIONS:')
    console.log('1. Verify the NativeStaking precompile is deployed to testnet')
    console.log('2. Check if the precompile implementation matches the interface')
    console.log('3. Ensure the precompile is activated in the runtime')
    console.log('4. Test with a simple contract call outside DefiLlama infrastructure')
    console.log('')
    
    // Throw detailed error for debugging
    const errorMessage = `Zenchain NativeStaking precompile is not functional. ${errors.length} function calls failed. ` +
                         `Most common error: "${errors[0]?.error?.decodedError || errors[0]?.error?.message}". ` +
                         `This indicates the precompile is not yet implemented on testnet.`
    
    const detailedError = new Error(errorMessage)
    detailedError.precompileErrors = errors
    detailedError.precompileAddress = STAKING_PRECOMPILE
    detailedError.interfaceUrl = 'https://github.com/zenchain-protocol/precompile-interfaces/blob/main/INativeStaking.sol'
    
    throw detailedError
  }
  
  // If we reach here, at least some functions worked
  console.log('✅ Precompile is partially functional!')
  console.log('TODO: Implement staking data aggregation using working functions')
  
  // For now, return empty balances until we can aggregate staking data
  return api.getBalances()
}

/**
 * Get TVL for Zenchain testnet (non-staking)
 * 
 * @param {Object} api - DefiLlama SDK API object
 * @returns {Promise<Object>} Balance object
 */
async function tvl(api) {
  // TODO: Add tracking for:
  // 1. Cross-chain bridged assets (when bridges are deployed)
  // 2. DEX liquidity pools (when DEX is deployed) 
  // 3. Lending protocol deposits (when lending protocols are deployed)
  // 4. NFT collateral values (when NFT-Fi is deployed)
  
  // Currently no TVL outside of staking on testnet
  return api.getBalances()
}

module.exports = {
  methodology: "Attempts to track ZTC tokens staked by validators and nominators on Zenchain testnet using the NativeStaking precompile interface (https://github.com/zenchain-protocol/precompile-interfaces/blob/main/INativeStaking.sol). Currently fails with detailed error reporting as the precompile is not yet implemented on testnet. Will return actual staking data once the precompile is deployed and functional.",
  start: 1704067200,
  zenchain_testnet: { // Testnet: Precompile not yet implemented
    tvl,
    staking,
  },
  // zenchain: {  // Reserved for mainnet
  //   tvl,
  //   staking,
  // },
}