
const BOOL_KEYS = [
  'HISTORICAL',
  'LLAMA_DEBUG_MODE',
  'STORE_IN_R2',
  'IS_RUN_FROM_CUSTOM_JOB',
]

const _yek = "b523cf66-7a5a-4fe8-8d67-f604fd0492c2"  // bifrost

const DEFAULTS = {
  EVMOS_MULTICALL_CHUNK_SIZE: "3", // evmos reduced gas limit, this is a workaround to make multicall work
  SEI_BLOCK_LOW: "150023881",
  STARKNET_RPC: 'https://api.zan.top/public/starknet-mainnet',
  STARKNET_MULTICALL: '0x01a33330996310a1e3fa1df5b16c1e07f0491fdd20c441126e02613b948f0225',
  ACALA_RPC: 'https://acala-rpc.aca-api.network',
  KARURA_RPC: 'https://karura-rpc.aca-api.network',
  COVALENT_KEY: 'ckey_72cd3b74b4a048c9bc671f7c5a6',
  // SOLANA_RPC: 'https://mainnet.helius-rpc.com/?api-key=0109717a-77b4-498a-bc3c-a0b31aa1b3bf',
  SOLANA_RPC: "https://api.mainnet-beta.solana.com",
  SOON_RPC: "https://rpc.mainnet.soo.network/rpc",
  SOON_BASE_RPC: "https://rpc.soonbase.soo.network/rpc",
  SOON_BSC_RPC: "https://rpc.svmbnbmainnet.soo.network/rpc",
  ECLIPSE_RPC: 'https://mainnetbeta-rpc.eclipse.xyz',
  APTOS_RPC: 'https://fullnode.mainnet.aptoslabs.com',
  SUI_RPC: 'https://sui-rpc.publicnode.com',
  // SUI_GRAPH_RPC: 'https://sui-mainnet.mystenlabs.com/graphql',
  SUI_GRAPH_RPC: 'https://graphql.mainnet.sui.io/graphql',
  MULTIVERSX_RPC: 'https://api.multiversx.com',
  ANKR_API_KEY: '79258ce7f7ee046decc3b5292a24eb4bf7c910d7e39b691384c7ce0cfb839a01',
  SUBSCAN_API_KEY: 'ca3ba5ed1ff44b689c5f81dfc6b1644b',
  RENEC_RPC: "https://api-mainnet-beta.renec.foundation:8899/",
  FOGO_RPC: 'https://mainnet.fogo.io',
  COOKIECHAIN_RPC: 'https://rpc.cookiescan.io',
  LULO_API_KEY: '',
  TRON_RPC: 'https://api.trongrid.io',
  MOVE_RPC: 'https://mainnet.movementnetwork.xyz',
  SUPRA_RPC: 'https://rpc-mainnet.supra.com',
  IOTA_RPC: "https://api.mainnet.iota.cafe",
  MEGAETH_ARCHIVAL_RPC: 'https://megaeth.blockscout.com/api/eth-rpc',
  SHIDO_RPC: 'https://shidoscan.net/api/eth-rpc',
  BITKUB_RPC: 'https://www.kubscan.com/api/eth-rpc',
  REI_RPC: 'https://scan.rei.network/api/eth-rpc',
  PEPU_RPC: 'https://pepuscan.com/api/eth-rpc',
  // dwellir throttles queryStorageAt bursts across both bifrost endpoints (same key) which stalled bifrost-dex; polkadot side moved to liebi
  // bifrost adapters read storage over HTTP JSON-RPC via helper/chain/substrate.js (the wss entries are kept for anything still on @polkadot/api)
  BIFROST_P_RPC: "wss://eu.bifrost-polkadot-rpc.liebi.com/ws",
  BIFROST_K_RPC: "wss://api-bifrost-kusama.n.dwellir.com/" + _yek,
  BIFROST_POLKADOT_RPC: "https://eu.bifrost-polkadot-rpc.liebi.com",
  BIFROST_KUSAMA_RPC: "https://api-bifrost-kusama.n.dwellir.com/" + _yek,
  // substrate chains read over HTTP JSON-RPC (helper/chain/substrate.js), comma separated fallbacks
  BITTENSOR_RPC: 'https://entrypoint-finney.opentensor.ai',
  POLYMESH_RPC: 'https://mainnet-rpc.polymesh.network',
  ASTAR_SUBSTRATE_RPC: 'https://astar.api.onfinality.io/public,https://rpc.astar.network,https://astar-rpc.dwellir.com',
  SORA_RPC: 'https://mof2.sora.org',
  POLKADOT_RELAY_RPC: 'https://rpc.polkadot.io,https://polkadot-rpc.publicnode.com,https://dot-rpc.stakeworld.io',
  POLKADOT_ASSETHUB_RPC: 'https://polkadot-asset-hub-rpc.polkadot.io,https://statemint.api.onfinality.io/public',
  HYDRATION_RPC: 'https://rpc.hydradx.cloud',
  BLOCKFROST_PROJECT_ID: 'mai'+'nnetBfkdsCOvb4BS'+'VA6pb1D43ptQ7t3cLt06',
  FUEL_CUSTOM_RPC: 'https://mainnet.fuel.network/v1/graphql',
  TATUM_PUBLIC_API_KEY: "t-" + "698992414f6f4e3435d62161" + "-3d94ca2d70024efdaf3ca6fd",
  KEETA_RPC: "https://rep1.main.network.api.keeta.com/api",
  CRYPTOAPIS_API_KEY: "35c1b8a" + "cd1119" + "b98dbe59e821ab734b87dfe6f84",
  PROPTECH_RPC: "https://mainnet.ptekcoin.com",
  FLARE_ARCHIVAL_RPC: 'https://flare-explorer.flare.network/api/eth-rpc',
  PROM_RPC: 'https://promscan.io/api/eth-rpc,https://prom-rpc.eu-north-2.gateway.fm',
  PROM_RPC_MULTICALL: '0xfF785aF3De8C2cb5727A8665984E741c16679131',
  NIBIRU_RPC_MULTICALL: '0xcA11bde05977b3631167028862bE2a173976CA11',
  RISE_ARCHIVAL_RPC: 'https://explorer.risechain.com/api/eth-rpc', // public rpc.risechain.com caps eth_getLogs at 5000 blocks
  ARC_RPC: 'https://rpc.mainnet.arc.io',
  ARC_RPC_CHAIN_ID: '5042',
  ARC_ARCHIVAL_RPC: 'https://explorer.arc.io/api/eth-rpc', // public rpc.mainnet.arc.io rejects large eth_getLogs ranges
  // Arc is not in the SDK Multicall3 deployment map. Without this, eth.getBalances skips
  // getEthBalance() and fans out getBalance against ARC_RPC (429s). Archival is getLogs-only.
  ARC_RPC_MULTICALL: '0xcA11bde05977b3631167028862bE2a173976CA11',
  ARC_RPC_MULTICALL_V3: '0xcA11bde05977b3631167028862bE2a173976CA11',
  // chains with no provider in the SDK providers list (chainid.network RPCs)
  AREA_RPC: 'https://mainnet-rpc.areum.network,https://mainnet-rpc2.areum.network', // Areum Network, chainId 463
  BCYPHER_RPC: 'https://mainapi.bchscan.io', // BC Hyper Chain, chainId 3030
}

const ENV_KEYS = [
  ...BOOL_KEYS,
  ...Object.keys(DEFAULTS),
  'ELASTICSEARCH_CONFIG',
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
  'DUNE_API_KEYS',
  'NEAR_RPC',
  'TON_API_KEY',
  'FLOW_NON_EVM_RPC',
  'PROXY_AUTH',
  'UI_TOOL_MODE',
  'P0_API_KEY',
  'CRYPTOAPIS_API_KEY',
  'TATUM_PUBLIC_API_KEY',
  'TATUM_API_KEY',
  'TEAM_WEBHOOK',
  'HIRO_API_KEY',
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
