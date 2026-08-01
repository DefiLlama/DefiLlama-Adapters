const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const METADATA_URL = 'https://metadata.layerzero-api.com/v1/metadata'

const NATIVES = [ADDRESSES.metis.Metis]

const CHAIN_MAP = {
  avax:          'avalanche',
  berachain:     'bera',
  plume_mainnet: 'plumephoenix',
  xdai:          'gnosis',
  rsk:           'rootstock',
  swellchain:    'swell',
  era:           'zksync',
  wc:            'worldchain',
  op_bnb:        'opbnb',
  core:          'coredao',
  '0g':          'og',
}

async function tvl(api) {
  const meta = await getConfig('layer-zero/metadata', METADATA_URL)
  const tokens = meta[CHAIN_MAP[api.chain] || api.chain]?.tokens || {}

  const proxies = []
  for (const info of Object.values(tokens)) {
    if (!info.proxyAddresses) continue
    for (const proxy of info.proxyAddresses) {
      if (typeof proxy === 'string' && proxy.length === 42) proxies.push(proxy)
    }
  }
  if (!proxies.length) return {}

  const resolved = new Map()
  for (const abi of ['address:token', 'address:canonicalToken', 'address:l1Token']) {
    const todo = proxies.filter(p => !resolved.has(p))
    if (!todo.length) break
    const res = await api.multiCall({ abi, calls: todo, permitFailure: true })
    todo.forEach((p, i) => { if (res[i]) resolved.set(p, res[i]) })
  }

  const tokensAndOwners = []
  for (const proxy of proxies) {
    let underlying = resolved.get(proxy)
    if (!underlying) continue
    if (NATIVES.includes(underlying.toLowerCase())) underlying = ADDRESSES.null
    tokensAndOwners.push([underlying, proxy])
  }

  await sumTokens2({ api, tokensAndOwners })
}

const chains = [
  'ethereum', 'bsc', 'base', 'arbitrum', 'hyperliquid', 'polygon', 'avax',
  'optimism', 'berachain', 'plasma', 'hemi', 'rsk', 'ink', 'katana',
  'monad', 'fantom', 'tac', 'mode', 'sonic', 'mantle', 'celo', 'fraxtal',
  'citrea', 'stable', 'xdai', 'linea', 'xlayer', 'nibiru', 'abstract',
  'era', 'metis', 'peaq', 'flare', 'astar', 'blast',
  'plume_mainnet', 'tempo', 'scroll', 'sei', 'unichain', 'morph',
  'soneium', 'manta', 'klaytn', 'xdc', 'swellchain', 'taiko',
  'kava', 'bob', 'flow', 'canto', 'wc', 'hedera', 'op_bnb', 'goat',
  'moonriver', 'conflux', 'lisk', 'megaeth', 'harmony',
]

module.exports = {
  methodology: 'Counts tokens locked in LayerZero adapter contracts on each chain. Addresses are fetched from the LayerZero metadata API.',
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
