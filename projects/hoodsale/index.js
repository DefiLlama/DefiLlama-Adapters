const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// HoodSale, the presale launchpad on Robinhood Chain. Three on-chain sources of locked value:
// the ETH a running sale escrows for its contributors, the LP a finished V2 sale locked, and the
// Uniswap v4 position a finished v4 sale opened, which HoodSale's contracts hold for good.
const PRESALE_FACTORY = '0x8dcC19e98713C2EC024dd337Edea18BEBC490942'
const V4_POSITION_MANAGER = '0x58daec3116aae6d93017baaea7749052e8a04fa7'
const DEAD = '0x000000000000000000000000000000000000dEaD'

const abi = {
  allPresales: 'function allPresales(uint256) view returns (address)',
  allPresalesLength: 'uint256:allPresalesLength',
  locker: 'address:locker',
  lockCount: 'uint256:lockCount',
  locks: 'function locks(uint256) view returns (address token, address owner, uint256 amount, uint64 unlockTime, bool withdrawn)',
  v4Launcher: 'address:v4Launcher',
  // the first member of the sale's params struct; every member is a static word, so the rest is ignored
  saleToken: 'function params() view returns (address token)',
  launchOf: 'function launchOf(address token) view returns (bytes32 poolId, uint256 tokenId, uint256 lockId, bool burned, bool done)',
  hook: 'address:hook',
  ownerOf: 'function ownerOf(uint256 tokenId) view returns (address)',
}

// The launch position of every v4 sale that has launched. The launcher gives it to the hook (fee
// mode, which no function can take it back from), to its position locker or to the dead address
// (hook mode); a position anywhere else is no longer locked and is left out.
async function v4LaunchPositions(api, presales) {
  const launchers = await api.multiCall({ abi: abi.v4Launcher, calls: presales, permitFailure: true })
  const sales = presales
    .map((presale, i) => ({ presale, launcher: launchers[i] }))
    .filter(({ launcher }) => launcher && launcher !== ADDRESSES.null)
  if (!sales.length) return []

  const tokens = await api.multiCall({ abi: abi.saleToken, calls: sales.map(({ presale }) => presale) })
  const launches = await api.multiCall({
    abi: abi.launchOf,
    calls: sales.map(({ launcher }, i) => ({ target: launcher, params: [tokens[i]] })),
  })

  const launcherSet = [...new Set(sales.map(({ launcher }) => launcher.toLowerCase()))]
  const [hooks, lockers] = await Promise.all([
    api.multiCall({ abi: abi.hook, calls: launcherSet }),
    api.multiCall({ abi: abi.locker, calls: launcherSet }),
  ])
  const holders = new Set([...hooks, ...lockers, DEAD].filter(i => i && i !== ADDRESSES.null).map(i => i.toLowerCase()))

  const ids = launches.filter(launch => launch.done).map(launch => launch.tokenId)
  if (!ids.length) return []
  const owners = await api.multiCall({ abi: abi.ownerOf, target: V4_POSITION_MANAGER, calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i] && holders.has(owners[i].toLowerCase()))
}

async function tvl(api) {
  const presales = await api.fetchList({
    lengthAbi: abi.allPresalesLength,
    itemAbi: abi.allPresales,
    target: PRESALE_FACTORY,
  })

  const [currentLocker, saleLockers] = await Promise.all([
    api.call({ abi: abi.locker, target: PRESALE_FACTORY }),
    api.multiCall({ abi: abi.locker, calls: presales }),
  ])
  const lockers = [...new Set([currentLocker, ...saleLockers].filter(i => i && i !== ADDRESSES.null))]

  // A sale holds its contributions as native ETH until it launches or refunds, so the balance is
  // the escrow; a settled sale simply holds nothing, which is why no status filter is needed.
  const ownerTokens = presales.map(presale => [[ADDRESSES.null], presale])

  // Locked LP, for the sales that locked their liquidity instead of burning it. Balances come
  // from the locker itself, so a lock that has been withdrawn drops out on its own; the lock list
  // only supplies the token set.
  const lockLists = await Promise.all(lockers.map(locker => api.fetchList({
    lengthAbi: abi.lockCount,
    itemAbi: abi.locks,
    target: locker,
  })))
  lockLists.forEach((locks, i) => {
    const tokens = [...new Set(locks.map(lock => lock.token))]
    if (tokens.length) ownerTokens.push([tokens, lockers[i]])
  })

  await sumTokens2({ api, ownerTokens, resolveLP: true })

  const positionIds = await v4LaunchPositions(api, presales)
  if (positionIds.length) await sumTokens2({ api, uniV4ExtraConfig: { positionIds } })

  const quoteAssets = new Set([ADDRESSES.null, ADDRESSES.robinhood.WETH].map(a => a.toLowerCase()))
  for (const key of Object.keys(api.getBalances())) {
    const token = key.split(':').pop()
    if (!quoteAssets.has(token.toLowerCase())) api.removeTokenBalance(token)
  }
}

module.exports = {
  methodology: 'ETH escrowed in HoodSale presale contracts while a sale is running (contributions are held by the sale until it launches or refunds), plus the liquidity locked by finished sales: V2 LP held in the HoodSale LiquidityLocker by sales that chose to lock instead of burning it, and the Uniswap v4 launch position of v4 sales, held for good by the HoodSale hook, the v4 position locker or the dead address. Only the ETH side of the locked liquidity is counted. Lockers are read from the factory and from the sales themselves, so a locker replaced through setLocker stays counted. Locked liquidity also sits in the DEX pools tracked separately, so it is marked as double counted. Platform revenue held by the Treasury is not counted.',
  doublecounted: true,
  start: '2026-09-04',
  robinhood: { tvl },
}
