const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// HoodSale, the presale launchpad on Robinhood Chain. Two on-chain sources of locked value:
// the ETH a running sale escrows for its contributors, and the LP a finished sale locked.
const PRESALE_FACTORY = '0x8dcC19e98713C2EC024dd337Edea18BEBC490942'

const abi = {
  allPresales: 'function allPresales(uint256) view returns (address)',
  allPresalesLength: 'uint256:allPresalesLength',
  locker: 'address:locker',
  lockCount: 'uint256:lockCount',
  locks: 'function locks(uint256) view returns (address token, address owner, uint256 amount, uint64 unlockTime, bool withdrawn)',
}

/**
 * TVL of HoodSale on Robinhood Chain.
 *
 * Adds the native ETH every presale contract holds, which is what a running sale escrows for its
 * contributors, and the LP held by each liquidity locker, unwrapped to the underlying tokens.
 * Every address is resolved from the factory, so a locker that is replaced with
 * `PresaleFactory.setLocker` keeps being counted: a sale stores the locker it was created with as
 * an immutable, so reading `locker()` off the sales themselves yields every locker in use, past
 * or present, and the factory's current one covers a locker no sale has reached yet.
 *
 * @param {object} api the chain api DefiLlama injects
 * @returns {Promise<object>} balances keyed by token
 */
async function tvl(api) {
  const presales = await api.fetchList({
    lengthAbi: abi.allPresalesLength,
    itemAbi: abi.allPresales,
    target: PRESALE_FACTORY,
  })

  const [currentLocker, saleLockers] = await Promise.all([
    api.call({ abi: abi.locker, target: PRESALE_FACTORY }),
    api.multiCall({ abi: abi.locker, calls: presales, permitFailure: true }),
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

  return sumTokens2({ api, ownerTokens, resolveLP: true })
}

module.exports = {
  methodology:
    'ETH escrowed in HoodSale presale contracts while a sale is running (contributions are held by the sale until it launches or refunds), plus the liquidity locked in the HoodSale LiquidityLocker by sales that chose to lock their LP instead of burning it, unwrapped to its underlying tokens. Lockers are read from the factory and from the sales themselves, so a locker replaced through setLocker stays counted. Locked LP also sits in the DEX pools tracked separately, so it is marked as double counted. Platform revenue held by the Treasury is not counted.',
  doublecounted: true,
  start: '2026-09-04',
  robinhood: { tvl },
}
