const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
]

const ENV_KEYS = [
  ...BOOL_KEYS,
  'GETBLOCK_KEY',
  'SOLANA_RPC',
  'APTOS_RPC',
  'SUI_RPC',
  'LOFTY_API',
  'COVALENT_KEY',
  'OLYMPUS_GRAPH_API_KEY',
]

const DEFAULTS = {
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  SOLANA_RPC: 'https://try-rpc.mainnet.solana.blockdaemon.tech',
  APTOS_RPC: 'https://aptos-mainnet.pontem.network',
  SUI_RPC: 'https://fullnode.mainnet.sui.io/',
}

function getEnv(key) {
  if (!ENV_KEYS.includes(key)) throw new Error(`Unknown env key: ${key}`)
  const value = process.env[key] ?? DEFAULTS[key]
  return BOOL_KEYS.includes(key) ? !!value : value
}

module.exports = {
  getEnv,
}