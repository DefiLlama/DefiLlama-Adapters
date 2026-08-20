const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens2: sumSolanaTokens } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const METADATA_URL = 'https://metadata.layerzero-api.com/v1/metadata'

const NATIVES = [ADDRESSES.metis.Metis]

const CHAIN_MAP = {
  '0g':              'og',
  ap3x:              'apexfusionnexus',
  apechain:          'ape',
  avax:              'avalanche',
  berachain:         'bera',
  bittensor_evm:     'subtensorevm',
  chz:               'chiliz',
  core:              'coredao',
  cronos:            'cronosevm',
  era:               'zksync',
  etlk:              'etherlink',
  irys_mainnet_beta: 'irys',
  kiteai:            'kite',
  lightlink_phoenix: 'lightlink',
  op_bnb:            'opbnb',
  plume_mainnet:     'plumephoenix',
  polygon_zkevm:     'zkevm',
  rbn:               'redbelly',
  rls:               'rayls',
  rsk:               'rootstock',
  sty:               'story',
  swellchain:        'swell',
  tomochain:         'tomo',
  vana:              'islander',
  vfl:               'zkverify',
  wc:                'worldchain',
  xdai:              'gnosis',
}

// Escrows holding a LayerZero-minted wrapper instead of original collateral — their backing is
// already counted at the canonical lockbox (USDT0: ethereum 0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee).
// Listed only when both hold: LayerZero can mint the token on that chain (`mintAndBurn` proxy in the
// metadata), and the lockbox balance covers total destination supply. The mint test alone would
// wrongly drop natively-issued assets such as Arbitrum PYUSD. Derivation:
// audit/protocols/layer-zero-proxyoft.md. Keyed `<chain>:<proxy>` — proxies repeat across chains.
const WRAPPER_ESCROWS = new Set([
  'arbitrum:0x77652d5aba086137b595875263fc200182919b92',    // USDT0
  'arbitrum:0x297f0b9a452d34c9b1c15b36b173a9a0b0f0e10b',    // USDT0
  'arbitrum:0x238a52455a1ef6c987cac94b28b4081afe50ba06',    // USDT0
  'arbitrum:0x14e4a1b13bf7f943c8ff7c51fb60fa964a298d92',    // USDT0 (minter leg)
  'optimism:0x8efbdff3bae9a3ed3c0ac7ad86bebf9aee46086f',    // USDT0.s
  'xlayer:0x94bcca6bdfd6a61817ab0e960bfede4984505554',      // USDT0
  'hyperliquid:0x904861a24f30ec96ea7cfc3be9ea4b476d237e98', // USDT0.s
])

function getEscrows(meta, chain) {
  const tokens = meta[CHAIN_MAP[chain] || chain]?.tokens || {}
  const escrows = []
  for (const [token, info] of Object.entries(tokens)) {
    if (!info.proxyAddresses) continue
    for (const proxy of info.proxyAddresses) {
      if (typeof proxy !== 'string' || proxy.length !== 42) continue
      if (WRAPPER_ESCROWS.has(`${chain}:${proxy.toLowerCase()}`)) continue
      escrows.push({ proxy, declared: info.erc20TokenAddress || token })
    }
  }
  return escrows
}

async function tvl(api) {
  const meta = await getConfig('layer-zero/metadata', METADATA_URL)
  const proxies = getEscrows(meta, api.chain).map(i => i.proxy)
  if (!proxies.length) return {}

  const resolved = new Map()
  for (const abi of ['address:token', 'address:canonicalToken', 'address:l1Token']) {
    const todo = proxies.filter(p => !resolved.has(p))
    if (!todo.length) break
    const res = await api.multiCall({ abi, calls: todo, permitFailure: true })
    todo.forEach((p, i) => { if (res[i]) resolved.set(p, res[i]) })
  }

  if (!resolved.size) console.error(`layer-zero: ${api.chain} resolved 0 of ${proxies.length} proxies, reporting $0`)

  const tokensAndOwners = []
  for (const proxy of proxies) {
    let underlying = resolved.get(proxy)
    if (!underlying) continue
    if (NATIVES.includes(underlying.toLowerCase())) underlying = ADDRESSES.null
    tokensAndOwners.push([underlying, proxy])
  }

  await sumTokens2({ api, tokensAndOwners })
}

async function tronTvl(api) {
  const meta = await getConfig('layer-zero/metadata', METADATA_URL)
  const tokensAndOwners = [], nativeEscrows = []
  for (const { proxy, declared } of getEscrows(meta, api.chain)) {
    if (declared === ADDRESSES.null) nativeEscrows.push(proxy)
    else tokensAndOwners.push([declared, proxy])
  }

  if (tokensAndOwners.length) await sumTokens2({ api, tokensAndOwners })
  for (const proxy of nativeEscrows)
    api.add(ADDRESSES.null, (await api.provider.getBalance(proxy)).toString())
}

async function solanaTvl(api) {
  const meta = await getConfig('layer-zero/metadata', METADATA_URL)
  const tokenAccounts = Object.values(meta.solana?.tokens || {})
    .map(i => i.escrowTokenAddress)
    .filter(i => typeof i === 'string')
  if (tokenAccounts.length) await sumSolanaTokens({ api, tokenAccounts: [...new Set(tokenAccounts)] })
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
  'apechain', 'degen', 'somnia', 'telos', 'robinhood', 'moonbeam', 'cronos',
  'polygon_zkevm', 'zora', 'sophon', 'xpla', 'ethereal', 'sanko', 'core', '0g',
  'gensyn', 'chz', 'vana', 'rbn', 'sty', 'bittensor_evm', 'irys_mainnet_beta',
  'vfl', 'etlk', 'codex', 'kiteai', 'lightlink_phoenix', 'tomochain', 'ap3x',
  'rls',
]

module.exports = {
  methodology: 'Counts assets escrowed in LayerZero OFT Adapter / ProxyOFT lockboxes on each chain, discovered from the LayerZero metadata API. Pure mint-and-burn OFTs hold no collateral and are not counted. Destination-chain escrows that hold a LayerZero-minted wrapper are excluded, since the collateral backing them is already counted at its canonical lockbox, escrows holding natively-issued assets are counted even where the metadata annotates them as pegged to another chain.',
  tron: { tvl: tronTvl },
  solana: { tvl: solanaTvl },
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
