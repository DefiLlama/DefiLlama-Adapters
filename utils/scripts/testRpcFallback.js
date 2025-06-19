const sdk = require('@defillama/sdk')
const { rpcFallbackSUI } = require('../../projects/helper/chain/sui')
const { rpcFallbackConnection } = require('../../projects/helper/solana')
const { rpcFallbackStarknet } = require('../../projects/helper/chain/starknet')

async function testSolana () {
  const version = await rpcFallbackConnection('solana', conn => conn.getVersion())
  sdk.log('[solana] version →', version)
}

async function testEclipse () {
  const version = await rpcFallbackConnection('eclipse', conn => conn.getVersion())
  sdk.log('[eclipse] version →', version)
}

async function testRenec () {
  const version = await rpcFallbackConnection('renec', conn => conn.getVersion())
  sdk.log('[renec] version →', version)
}

async function testSui () {
  const { result, error } = await rpcFallbackSUI('sui', {
    jsonrpc: '2.0',
    id: 1,
    method: 'sui_getLatestCheckpointSequenceNumber',
    params: [],
  })
  if (error) throw new Error(error.message)
  sdk.log('[sui] latest checkpoint →', Number(result))
}

async function testStarknet () {
  const { result } = await rpcFallbackStarknet({
    jsonrpc: '2.0',
    id: 1,
    method: 'starknet_blockNumber',
    params: [],
  })
  sdk.log('[starknet] latest block →', result)
}

async function main () {
  await testSolana()
  await testEclipse()
  await testRenec()
  await testSui()
  await testStarknet()
}

main().catch((e) => { console.error(e); process.exit(1) })
