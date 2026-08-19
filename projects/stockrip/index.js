const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const CORE = '0x32E8D5b0b8643dC002864a2F5e4481E59eb714CB'
const FROM_BLOCK = 20775480

const WHITELISTED = 'function collectionWhitelisted(address) view returns (bool)'
const OWNER_OF = 'function ownerOf(uint256) view returns (address)'
const TBA_OF = 'function tbaOf(uint256) view returns (address)'
const MANIFEST_OF = 'function manifestOf(uint256) view returns (address[])'

async function tvl(api) {
  await api.getBlock()

  const logs = await getLogs({
    api,
    target: CORE,
    eventAbi: 'event CollectionWhitelistSet(address indexed collection, bool allowed)',
    onlyArgs: true,
    fromBlock: FROM_BLOCK,
  })
  const seen = [...new Set(logs.map((log) => log.collection))]
  const allowed = await api.multiCall({ abi: WHITELISTED, target: CORE, calls: seen })
  const collections = seen.filter((_, i) => allowed[i])

  const counts = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: collections.map((target) => ({ target, params: [CORE] })),
  })
  const held = Object.fromEntries(collections.map((c, i) => [c, +counts[i]]))
  const custodial = collections.filter((c) => held[c] > 0)

  // Not permitFailure: a collection the core holds is a basket, so a failure here is either a real
  // anomaly or a bad RPC, and skipping it would silently drop that basket's whole underlying.
  const lastIds = await api.multiCall({ abi: 'uint256:nextId', calls: custodial })

  const ownerTokens = [[[ADDRESSES.null], CORE]]

  for (const [i, collection] of custodial.entries()) {
    // wrap() assigns tokenId = ++nextId, so nextId is the last id minted and the range is inclusive.
    const ids = Array.from({ length: +lastIds[i] }, (_, j) => j + 1)
    const owners = await api.multiCall({ abi: OWNER_OF, target: collection, calls: ids, permitFailure: true })
    const mine = ids.filter((_, j) => owners[j] && owners[j].toLowerCase() === CORE.toLowerCase())

    if (mine.length !== held[collection])
      throw new Error(`StockRip: found ${mine.length} ${collection} held by core, balanceOf says ${held[collection]}`)

    const [accounts, manifests] = await Promise.all([
      api.multiCall({ abi: TBA_OF, target: collection, calls: mine, permitFailure: true }),
      api.multiCall({ abi: MANIFEST_OF, target: collection, calls: mine, permitFailure: true }),
    ])
    ownerTokens.push(...accounts.map((account, j) => [manifests[j], account]).filter(([manifest, account]) => manifest && account))
  }

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    "ETH held by the StockRip core contract, plus the tokenized equities backing every basket it custodies. Ownership is checked per token id, so a basket only counts while the core actually holds it. Each basket keeps its stock in an ERC-6551 account, so the underlying is read from that account as a real balance, with assets taken from the basket's own manifest rather than a fixed list. Baskets held by users, the RIP token and the VRF operating reserves are excluded.",
  start: 1785159701,
  robinhood: { tvl },
}
