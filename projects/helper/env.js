
const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
]

const DEFAULTS = {
  WATER_MULTICALL_RPC: "0x63cee78B11774535132fd773C5dDe3c4b41CD07f",
  EVMOS_MULTICALL_CHUNK_SIZE: "3", // evmos reduced gas limit, this is a workaround to make multicall work
  STARKNET_RPC: 'https://starknet-mainnet.public.blastapi.io',
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  // SOLANA_RPC: 'https://mainnet.helius-rpc.com/?api-key=0109717a-77b4-498a-bc3c-a0b31aa1b3bf',
  SOLANA_RPC: "https://api.mainnet-beta.solana.com",
  ECLIPSE_RPC: 'https://eclipse.lgns.net',
  APTOS_RPC: 'https://fullnode.mainnet.aptoslabs.com',
  SUI_RPC: 'https://fullnode.mainnet.sui.io/',
  SUI_GRAPH_RPC: 'https://sui-mainnet.mystenlabs.com/graphql',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  FLOW_RPC: "https://rest-mainnet.onflow.org",
  SONEIUM_RPC: "https://rpc.soneium.org",
  SONEIUM_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",
  RONIN_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",
  SUPERPOSITION_RPC: "https://rpc.superposition.so",
  OCC_RPC: "https://rpc.edu-chain.raas.gelato.cloud"
}

const ENV_KEYS = [
  ...BOOL_KEYS,
  ...Object.keys(DEFAULTS),
  'GETBLOCK_KEY',
  'LOFTY_API',
  'SOLANA_RPC_CLIENT',
  'OLYMPUS_GRAPH_API_KEY',
  'SUMMER_HISTORY_ENDPOINT',
  'SUMMER_AJNA_ENDPOINT',
  'SUMMER_CONFIRMED_VAULTS_ENDPOINT',
  'ETHEREUM_TOKENS_ENDPOINT',
  'FBTC_ACCESS_TOKEN',
  'UNISAT_AUTH',
  'RPC_PROXY_URL',
  'BLACKSAIL_API_KEY',
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
