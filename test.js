const { default: Axios } = require('axios')

async function testKasplexContracts() {
  const rpc = 'https://evmrpc.kasplex.org/'
  
  console.log('Testing Kasplex RPC...\n')
  
  // Helper function for RPC calls
  async function call(method, params = []) {
    try {
      const response = await Axios.post(rpc, {
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      })
      return response.data.result
    } catch (e) {
      throw new Error(e.response?.data?.error?.message || e.message)
    }
  }
  
  // Test 1: Network connection
  try {
    const blockNumber = await call('eth_blockNumber')
    console.log('✓ RPC Connected! Block:', parseInt(blockNumber, 16))
  } catch (e) {
    console.error('✗ RPC Failed:', e.message)
    return
  }
  
  // Test 2: Factory contract
  const FACTORY = '0x98bb580a77ee329796a79abd05c6d2f2b3d5e1bd'
  try {
    const code = await call('eth_getCode', [FACTORY, 'latest'])
    if (code === '0x') {
      console.error('✗ Factory has no code at', FACTORY)
    } else {
      console.log('✓ Factory exists:', FACTORY, `(${code.length} bytes)`)
    }
  } catch (e) {
    console.error('✗ Factory check failed:', e.message)
  }
  
  // Test 3: WKAS token
  const WKAS = '0x2c2ae87ba178f48637acae54b87c3924f544a83e'
  try {
    const code = await call('eth_getCode', [WKAS, 'latest'])
    if (code === '0x') {
      console.error('✗ WKAS has no code at', WKAS)
    } else {
      console.log('✓ WKAS exists:', WKAS)
    }
  } catch (e) {
    console.error('✗ WKAS check failed:', e.message)
  }
  
  // Test 4: ZEAL token
  const ZEAL = '0xb7a95035618354d9adfc49eca49f38586b624040'
  try {
    const code = await call('eth_getCode', [ZEAL, 'latest'])
    if (code === '0x') {
      console.error('✗ ZEAL has no code at', ZEAL)
    } else {
      console.log('✓ ZEAL exists:', ZEAL)
    }
  } catch (e) {
    console.error('✗ ZEAL check failed:', e.message)
  }
  
  // Test 5: Factory allPairsLength call
  try {
    // ABI for allPairsLength() returns uint256
    const data = '0x574f2ba3' // function selector for allPairsLength()
    const result = await call('eth_call', [
      { to: FACTORY, data },
      'latest'
    ])
    const length = parseInt(result, 16)
    console.log('✓ Factory has', length, 'pairs')
  } catch (e) {
    console.error('✗ Factory call failed:', e.message)
  }
}

testKasplexContracts()