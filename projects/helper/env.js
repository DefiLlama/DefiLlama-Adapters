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

  /* NAKA_RPC: 'https://node.nakachain.xyz',
  ETHF_RPC: 'https://rpc.dischain.xyz/',
  CORE_RPC: "https://rpc.coredao.org,https://rpc.ankr.com/core,https://1rpc.io/core,https://rpc-core.icecreamswap.com",
  BITGERT_RPC: "https://flux-rpc2.brisescan.com,https://mainnet-rpc.brisescan.com,https://chainrpc.com,https://serverrpc.com,https://flux-rpc.brisescan.com",
  BITCHAIN_RPC: "https://rpc.bitchain.biz/",
  OZONE_RPC: "https://node1.ozonechain.io",
  ZETA_RPC: "https://zetachain-evm.blockpi.network/v1/rpc/public,https://zetachain-mainnet-archive.allthatnode.com:8545",
  DEFIVERSE_RPC: "https://rpc.defi-verse.org/",
  ZKLINK_RPC: "https://rpc.zklink.io",
  KINTO_RPC: "https://rpc.kinto-rpc.com",
  DEFICHAIN_EVM_RPC: "https://dmc.mydefichain.com/mainnet,https://dmc01.mydefichain.com/mainnet",
  RSS3_VSL_RPC: "https://rpc.rss3.io",
  DEGEN_RPC: "https://rpc.degen.tips", */
  DEGEN_RPC_MULTICALL: "0xFBF562a98aB8584178efDcFd09755FF9A1e7E3a2",
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
