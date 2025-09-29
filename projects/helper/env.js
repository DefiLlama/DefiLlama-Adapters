
const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
  'STORE_IN_R2',
  'IS_RUN_FROM_CUSTOM_JOB',
]

const _yek = "b523cf66-7a5a-4fe8-8d67-f604fd0492c2"  // bifrost

const DEFAULTS = {
  EVMOS_MULTICALL_CHUNK_SIZE: "3", // evmos reduced gas limit, this is a workaround to make multicall work
  STARKNET_RPC: 'https://starknet-mainnet.public.blastapi.io',
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  // SOLANA_RPC: 'https://mainnet.helius-rpc.com/?api-key=0109717a-77b4-498a-bc3c-a0b31aa1b3bf',
  SOLANA_RPC: "https://api.mainnet-beta.solana.com",
  SOON_RPC: "https://rpc.mainnet.soo.network/rpc",
  SOON_BASE_RPC: "https://rpc.soonbase.soo.network/rpc",
  SOON_BSC_RPC: "https://rpc.svmbnbmainnet.soo.network/rpc",
  ECLIPSE_RPC: 'https://mainnetbeta-rpc.eclipse.xyz',
  APTOS_RPC: 'https://fullnode.mainnet.aptoslabs.com',
  SUI_RPC: 'https://sui-rpc.publicnode.com',
  SUI_GRAPH_RPC: 'https://sui-mainnet.mystenlabs.com/graphql',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  SUBSCAN_API_KEY: 'ca3ba5ed1ff44b689c5f81dfc6b1644b',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  FLOW_RPC: 'https://rest-mainnet.onflow.org',
  CAMP_RPC: 'https://rpc.camp.raas.gelato.cloud',
  LULO_API_KEY: '',
  TRON_RPC: 'https://api.trongrid.io',
  MOVE_RPC: 'https://mainnet.movementnetwork.xyz',
  SUPRA_RPC: 'https://rpc-mainnet.supra.com',
  FLAME_RPC: "https://rpc.flame.astria.org",
  BASECAMP_RPC: "https://rpc.basecamp.t.raas.gelato.cloud",
  BERACHAIN_ARCHIVAL_RPC: "https://bera.blockscout.com/api/eth-rpc",
  PLUME_RPC: "https://rpc.plume.org",
  NIBIRU_RPC: "https://evm-rpc.archive.nibiru.fi/",
  IOTA_RPC: "https://api.mainnet.iota.cafe",
  KAVA_ARCHIVAL_RPC: "https://evm.kava.io",
  BIFROST_P_RPC: "wss://api-bifrost-polkadot.n.dwellir.com/"+_yek,
  BIFROST_K_RPC: "wss://api-bifrost-kusama.n.dwellir.com/"+_yek,
  HYDRAGON_RPC: "https://rpc-mainnet.hydrachain.org",
  TAC_RPC: "https://rpc.tac.build",
  FRAXTAL_RPC: "https://rpc.frax.com",
  TAC_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",
  ABSTRACT_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",
  BITCI_RPC_MULTICALL: "0x777238B119cD07e6849b0817f284532DC0F9F8D9",  // bitci multicall3
  PLASMA_RPC: "https://rpc.plasma.to",
  PLASMA_RPC_MULTICALL: "0xcA11bde05977b3631167028862bE2a173976CA11",  // plasma multicall3
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
  'DEBANK_API_KEY',
  'SMARDEX_SUBGRAPH_API_KEY',
  'PROXY_AUTH',
  'ALLIUM_API_KEY',
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
