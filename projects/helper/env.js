
const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
]

const DEFAULTS = {
  EVMOS_MULTICALL_CHUNK_SIZE: "3", // evmos reduced gas limit, this is a workaround to make multicall work
  STARKNET_RPC: 'https://starknet-mainnet.public.blastapi.io',
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  // SOLANA_RPC: 'https://mainnet.helius-rpc.com/?api-key=0109717a-77b4-498a-bc3c-a0b31aa1b3bf',
  SOLANA_RPC: "https://api.mainnet-beta.solana.com",
  ECLIPSE_RPC: 'https://mainnetbeta-rpc.eclipse.xyz',
  APTOS_RPC: 'https://fullnode.mainnet.aptoslabs.com',
  SUI_RPC: 'https://fullnode.mainnet.sui.io/',
  SUI_GRAPH_RPC: 'https://sui-mainnet.mystenlabs.com/graphql',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  FLOW_RPC: 'https://rest-mainnet.onflow.org',
  LULO_API_KEY: '',
  ETLK_RPC: 'https://explorer.etherlink.com/api/eth-rpc',
  TRON_RPC: 'https://api.trongrid.io',
  MOVE_RPC: 'https://mainnet.movementnetwork.xyz',
  SUPRA_RPC: 'https://rpc-mainnet.supra.com',
  HEDERA_RPC_MULTICALL: '0x18fa376d92511dd04090566ab6144847c03557d8', // Hedera Multicall3 contract
  GOAT_RPC: 'https://rpc.goat.network',
  GOAT_RPC_MULTICALL: '0x0D30331D462a30E344ee599B7483E313D63fD42A',
  HYPERLIQUID_RPC: 'https://rpc.purroofgroup.com',
  HSK_RPC: 'https://hashkey.blockscout.com/api/eth-rpc',
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
  'BITCOIN_CACHE_API',
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
