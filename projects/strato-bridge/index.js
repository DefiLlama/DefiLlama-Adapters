const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

// The MercataBridge contract (0x…1008) on STRATO mainnet is the source of truth
// for which chains and assets the bridge supports. Its `chains` and `assets`
// mappings are not enumerable on-chain (no length/index getters), so the key set
// is read from Cirrus, the public read-only index of STRATO contract storage.
const CIRRUS = 'https://app.strato.nexus/cirrus/search'
const BRIDGE = '0000000000000000000000000000000000001008'

// chainId -> DefiLlama chain. Only chains listed here are exported; a new bridge
// chain needs a one-line addition, but its assets are picked up automatically.
const CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  linea: 59144,
  robinhood: 4663,
}

// Outbound direction: StratoNativeBridge locks STRATO-native assets in its
// custody vault when they leave the chain. Vault resolved on-chain from the bridge.
const STRATO_NATIVE_BRIDGE = '0x4d9e9c39180a75091b9c35bbb9064d67c7fdde5a'
const STRATO_NATIVE_TOKENS = [
  '0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010', // USDST
  '0xcdc93d30182125e05eec985b631c7c61b3f63ff0', // GOLDST
  '0x2c59ef92d08efde71fe1a1cb5b45f4f6d48fcc94', // SILVST
]
// $STRATO locked in the vault is exactly what circulates as the Ethereum STRATO
// ERC-20, which is where CoinGecko tracks it (`ethereum-strato`, 18 decimals).
// It has no price feed on the STRATO chain, so it is counted against that address.
const STRATO_ON_STRATO   = '0x2ca3e170e6714282da77815f7864b17f612f5f83'
const STRATO_ON_ETHEREUM = 'ethereum:0x4c93b9fbf7fd1777ccbcbc538b1d0a8b58fb1ad6'

const registry = (mapping) => getConfig(
  `strato-bridge/${mapping}`,
  `${CIRRUS}/BlockApps-MercataBridge-${mapping}?address=eq.${BRIDGE}&limit=1000`
)

// Custody address escrowing deposits for a chain, as configured on the bridge.
async function getCustody(chainId) {
  const chains = await registry('chains')
  const row = chains.find(i => +i.key === chainId && i.value.enabled)
  if (!row) throw new Error(`strato-bridge: chain ${chainId} not enabled on the bridge`)
  return '0x' + row.value.custody
}

// Every enabled asset routed from `chainId`. Each one backs a 1:1 wrapped *ST
// token minted on STRATO. `externalToken` is the zero address for native gas.
async function getTokens(chainId) {
  const assets = await registry('assets')
  const tokens = assets
    .filter(i => +i.value.externalChainId === chainId && i.value.enabled)
    .map(i => '0x' + i.value.externalToken)
  if (!tokens.length) throw new Error(`strato-bridge: no enabled assets for chain ${chainId}`)
  return tokens
}

module.exports = {
  methodology:
    'Inbound: assets escrowed in the Mercata bridge custody address on each source chain (Ethereum, Base, Linea, Robinhood Chain), each backing a 1:1 wrapped *ST token minted on STRATO. Custody addresses and the asset list per chain are read from the MercataBridge assets/chains registry on STRATO mainnet (only entries flagged enabled are counted). Outbound: STRATO-native assets (STRATO, USDST, GOLDST, SILVST) locked in the StratoNativeBridge custody vault while represented on other chains; locked $STRATO is priced against the Ethereum STRATO ERC-20 because it has no price feed on the STRATO chain.',
  start: 1775151906,
  strato: {
    tvl: async (api) => {
      const vault = await api.call({ target: STRATO_NATIVE_BRIDGE, abi: 'function custodyVault() view returns (address)' })
      await api.sumTokens({ owner: vault, tokens: STRATO_NATIVE_TOKENS })
      const stratoLocked = await api.call({ target: STRATO_ON_STRATO, abi: 'erc20:balanceOf', params: vault })
      if (BigInt(stratoLocked) > 0n) api.add(STRATO_ON_ETHEREUM, stratoLocked.toString(), { skipChain: true })
    },
  },
}

Object.entries(CHAIN_IDS).forEach(([chain, chainId]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const [owner, tokens] = await Promise.all([getCustody(chainId), getTokens(chainId)])
      return sumTokens2({ api, owner, tokens })
    },
  }
})
