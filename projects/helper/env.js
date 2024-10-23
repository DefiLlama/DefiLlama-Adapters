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
  FLOW_RPC: 'https://rest-mainnet.onflow.org',
  FLOW_EVM_RPC: 'https://mainnet.evm.nodes.onflow.org',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  IDEX_RPC: "https://xchain-rpc.idex.io",
  ETN_RPC: "https://rpc.ankr.com/electroneum",
  MATCHAIN_RPC: "https://rpc.matchscan.io,https://rpc.matchain.io",
  MATCHAIN_RPC_MULTICALL: "0xDa91510Bd8c50bfa54FC2BE2dD6dAbE03eA8496c",
  SHAPE_RPC:'https://mainnet.shape.network',
  SHAPE_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",
  WC_RPC: "https://worldchain-mainnet.g.alchemy.com/public",
  APECHAIN_RPC: "https://rpc.apechain.com"
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
