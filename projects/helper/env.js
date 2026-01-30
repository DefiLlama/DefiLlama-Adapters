
const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
  'STORE_IN_R2',
  'IS_RUN_FROM_CUSTOM_JOB',
]

const _yek = "b523cf66-7a5a-4fe8-8d67-f604fd0492c2"  // bifrost

const DEFAULTS = {
  EVMOS_MULTICALL_CHUNK_SIZE: "3", // evmos reduced gas limit, this is a workaround to make multicall work
  CRONOS_MULTICALL_CHUNK_SIZE: "10", // cronos reduced gas limit, this is a workaround to make multicall work
  KATANA_MULTICALL_CHUNK_SIZE: "50",
  STARKNET_RPC: 'https://rpc.starknet.lava.build/',
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
  FOGO_RPC: 'https://mainnet.fogo.io',
  LULO_API_KEY: '',
  TRON_RPC: 'https://api.trongrid.io',
  INJECTIVE_RPC_MULTICALL: '0xca11bde05977b3631167028862be2a173976ca11',
  OCC_RPC_MULTICALL: '0xca11bde05977b3631167028862be2a173976ca11',
  MOVE_RPC: 'https://mainnet.movementnetwork.xyz',
  SUPRA_RPC: 'https://rpc-mainnet.supra.com',
  IOTA_RPC: "https://api.mainnet.iota.cafe",
  KASPLEX_RPC: "https://evmrpc.kasplex.org",
  MEGAETH_ARCHIVAL_RPC: 'https://megaeth.blockscout.com/api/eth-rpc',
  PEPU_RPC: 'https://pepuscan.com/api/eth-rpc',
  PEPU_RPC_MULTICALL: '0xBB6bf9447031408804af92aE6fBeDc002Dcb20aB',  // need to change it to one that works
  SAGA_RPC: "https://sagaevm.jsonrpc.sagarpc.io",
  BIFROST_P_RPC: "wss://api-bifrost-polkadot.n.dwellir.com/" + _yek,
  BIFROST_K_RPC: "wss://api-bifrost-kusama.n.dwellir.com/" + _yek,
  BLOCKFROST_PROJECT_ID: 'mai'+'nnetBfkdsCOvb4BS'+'VA6pb1D43ptQ7t3cLt06',
  VIRBICOIN_RPC: "https://rpc.digitalregion.jp",
  TATUM_PUBLIC_API_KEY: "t-6956724efd74cfe6b231bee6-cd40df69ad2d423588e36fc6",
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
  'ALLIUM_API_KEY',
  'TON_API_KEY',
  'FLOW_NON_EVM_RPC',
  'PROXY_AUTH',
  'UI_TOOL_MODE',
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
