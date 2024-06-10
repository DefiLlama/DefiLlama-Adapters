const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
]

const DEFAULTS = {
  STARKNET_RPC: 'https://starknet-mainnet.public.blastapi.io',
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  SOLANA_RPC: 'https://mainnet.helius-rpc.com/?api-key=0109717a-77b4-498a-bc3c-a0b31aa1b3bf',
  APTOS_RPC: 'https://aptos-mainnet.pontem.network',
  SUI_RPC: 'https://fullnode.mainnet.sui.io/',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  BSQUARED_RPC: "https://rpc.bsquared.network,https://b2-mainnet.alt.technology", // add manually, short name is b2-mainnet
  BTR_RPC_MULTICALL: '0xc8818aaeaBF0dF9f3f3ffF54Ab185705177A6234',
  DEFICHAIN_EVM_RPC_MULTICALL: '0x7fEf77CDe3B41221Cff54B84Ea89D2EBc6b53352',
  BOUNCEBIT_RPC_MULTICALL: '0x493d616f5F9a64e5B3D527120E406439bdF29272',
  ZKLINK_RPC_MULTICALL: '0xa8738F57538E3Bb73872d1133F2358c7Fe56FD35',
  REAL_RPC: 'https://real.drpc.org', // added manually short name is re-al
  TAIKO_RPC: 'https://rpc.taiko.xyz', // added manually short name is tko-mainnet
  REAL_RPC_MULTICALL: '0xcA11bde05977b3631167028862bE2a173976CA11',
  SEI_RPC_MULTICALL: '0xcA11bde05977b3631167028862bE2a173976CA11',
  TAIKO_RPC_MULTICALL: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
  SEI_RPC: 'https://evm-rpc.sei-apis.com/',
  LUKSO_RPC: 'https://rpc.lukso.sigmacore.io',
  HAM_RPC: 'https://rpc.ham.fun',
  HAM_RPC_MULTICALL: '0xB7c3Ea932649fBD594C881aDCb3F19415e2EA2d5',
}

const ENV_KEYS = [
  ...BOOL_KEYS,
  ...Object.keys(DEFAULTS),
  'GETBLOCK_KEY',
  'LOFTY_API',
  'OLYMPUS_GRAPH_API_KEY',
  'SUMMER_HISTORY_ENDPOINT',
  'SUMMER_AJNA_ENDPOINT',
  'SUMMER_CONFIRMED_VAULTS_ENDPOINT',
  'UNISAT_AUTH'
]

Object.keys(DEFAULTS).forEach(i => {
  if (!process.env[i]) process.env[i] = DEFAULTS[i] // this is done to set the chain RPC details in @defillama/sdk
})


function getEnv(key) {
  if (!ENV_KEYS.includes(key)) throw new Error(`Unknown env key: ${key}`)
  const value = process.env[key] ?? DEFAULTS[key]
  return BOOL_KEYS.includes(key) ? !!value : value
}

module.exports = {
  ENV_KEYS,
  getEnv,
}
