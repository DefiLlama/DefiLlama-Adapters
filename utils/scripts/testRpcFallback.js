const sdk = require('@defillama/sdk')
const { rpcFallbackSUI } = require('../../projects/helper/chain/sui')
const { rpcFallbackConnection } = require('../../projects/helper/solana')
const { rpcFallbackStarknet } = require('../../projects/helper/chain/starknet')
const { withRpcFallback } = require('../../projects/helper/rpcFallback')

async function testSolana () {
  const version = await rpcFallbackConnection('solana', conn => conn.getVersion())
  sdk.log('[solana] version →', version)
}

async function testEclipse () {
  const version = await rpcFallbackConnection('eclipse', conn => conn.getVersion())
  sdk.log('[eclipse] version →', version)
}

async function testAptos () {
  try {
    const baseUrl = 'https://fullnode.mainnet.aptoslabs.com'
    const axios = require('axios')
    const directTest = await axios.get(`${baseUrl}/v1?source=tvl-adapter`)
    sdk.log('[aptos] direct test →', JSON.stringify(directTest.data, null, 2))
    
    const info = await withRpcFallback('aptos', (axiosInstance) => axiosInstance.get('/v1'))
    sdk.log('[aptos] full response →', JSON.stringify(info, null, 2))
    sdk.log('[aptos] ledger info →', info.ledger_version ?? info)
  } catch (error) {
    sdk.log('[aptos] error →', error.message)
  }
}

async function testSui () {
  const response = await rpcFallbackSUI('sui', {
    jsonrpc: '2.0',
    id: 1,
    method: 'sui_getLatestCheckpointSequenceNumber',
    params: [],
  })
  sdk.log('[sui] full response →', JSON.stringify(response, null, 2))
  if (response.error) throw new Error(response.error.message)
  sdk.log('[sui] latest checkpoint →', Number(response.result))
}

async function testStarknet () {
  const response = await rpcFallbackStarknet({
    jsonrpc: '2.0',
    id: 1,
    method: 'starknet_blockNumber',
    params: [],
  })
  sdk.log('[starknet] full response →', JSON.stringify(response, null, 2))
  sdk.log('[starknet] latest block →', response.result)
}

async function main () {
  await testSolana()
  await testEclipse()
  await testAptos()
  await testSui()
  await testStarknet()
}

main().catch((e) => { console.error(e); process.exit(1) })
