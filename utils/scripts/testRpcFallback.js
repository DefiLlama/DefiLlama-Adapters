const { rpcFallbackSUI } = require('../../projects/helper/chain/sui')
const { rpcFallbackSolana } = require('../../projects/helper/solana')
const { rpcFallbackStarknet } = require('../../projects/helper/chain/starknet')

async function testSolana () {
  const version = await rpcFallbackSolana(conn => conn.getVersion())
  console.log('[solana] version →', version)
}

async function testSui () {
  const { result, error } = await rpcFallbackSUI('sui', {
    jsonrpc: '2.0',
    id: 1,
    method: 'sui_getLatestCheckpointSequenceNumber',
    params: [],
  })
  if (error) throw new Error(error.message)
  console.log('[sui] latest checkpoint →', Number(result))
}

async function testStarknet () {
  const { result } = await rpcFallbackStarknet({
    jsonrpc: '2.0',
    id: 1,
    method: 'starknet_blockNumber',
    params: [],
  })
  console.log('[starknet] latest block →', result)
}

async function main () {
  await testSolana()
  await testSui()
  await testStarknet()
}

main().catch((e) => { console.error(e); process.exit(1) })
