const { post } = require('../helper/http')

const RPC = 'https://octra.network/rpc'
const BRIDGE_VAULT = 'oct5MrNfjiXFNRDLwsodn8Zm9hDKNGAYt3eQDCQ52bSpCHq'
const OCT_SCALE = 1e6

async function tvl(api) {
  const { result, error } = await post(RPC, {
    jsonrpc: '2.0',
    id: 1,
    method: 'octra_contractStorage',
    params: [BRIDGE_VAULT, 'total_locked'],
  }, {
    headers: { 'User-Agent': 'DefiLlama-Adapters/1.0' },
  })

  if (error || !/^\d+$/.test(result?.value))
    throw new Error(`octra-bridge: failed to read BridgeVault total_locked: ${JSON.stringify(error || result)}`)

  api.addCGToken('octra', Number(result.value) / OCT_SCALE)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the native OCT recorded as locked by the Octra BridgeVault for the OCT-to-wOCT bridge. The on-chain total_locked value is used instead of the vault account balance so surplus OCT unrelated to bridge claims is excluded.',
  octra: { tvl },
}
