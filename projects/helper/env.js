const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
]

const DEFAULTS = {
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  SOLANA_RPC: 'https://try-rpc.mainnet.solana.blockdaemon.tech',
  APTOS_RPC: 'https://aptos-mainnet.pontem.network',
  SUI_RPC: 'https://fullnode.mainnet.sui.io/',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ETHEREUMCLASSIC_RPC: 'https://etc.etcdesktop.com,https://etc.rivet.link',
  CRAB_RPC: 'https://darwiniacrab-rpc.dwellir.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
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
  getEnv,
}