const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapV4NFTs } = require('../helper/unwrapLPs')

/* Titan Locker, a token, LP, Uniswap V3/V4 position and vesting locker on
 * Robinhood Chain.
 *
 * Every lock is its own contract, created by a manager. TVL is the core-asset
 * side of what those lock contracts hold right now: ERC-20 and Uniswap V2 LP
 * balances read with balanceOf, and each lock's recorded Uniswap V3 or V4
 * position while the lock still owns it. A withdrawn lock holds nothing, so it
 * stops counting on its own.
 *
 * Lock ids run 0..tokenLockerCount-1 (the managers post-increment from 0).
 */

const LOCK_DATA_V1 =
  'function getTokenLockData(uint40) view returns (bool isLpToken, uint40 id, address contractAddress, address lockOwner, address token, address createdBy, uint40 createdAt, uint40 unlockTime, uint256 balance, uint256 totalSupply)'
const LOCK_DATA_V2 =
  'function getTokenLockData(uint40) view returns (uint8 kind, uint40 id, address contractAddress, address lockOwner, address asset, uint256 tokenId, address createdBy, uint40 createdAt, uint40 unlockTime, uint256 balance)'

// LockKind in ITitanLockerManagerV2: ERC20, UNIV3, UNIV4, ERC20_VESTING
const UNIV3 = 1
const UNIV4 = 2

// any other leg is the locking team's own token
const QUOTE_TOKENS = new Set(
  [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ADDRESSES.robinhood.USDe].map((t) => t.toLowerCase())
)

const config = {
  robinhood: {
    v1: ['0x713E56CeE7060F01F710bF26Aff988264dcfb311'],
    v2: [
      '0x26b0654a0756dcd036d4e7215324f3d2be34d79e', // V2
      '0x102a70bDA2C833b3483A2eE55C14c7ea0fb7A01B', // V2.1
      '0x4E907349FA31f9e42F0bf0E2E2fd09e6E1E2dB9d', // V2.1 vault (Titan.fun launch locks)
    ],
  },
}

async function readLocks(api, managers, abi) {
  if (!managers.length) return []
  const counts = await api.multiCall({ abi: 'function tokenLockerCount() view returns (uint40)', calls: managers })
  const calls = managers.flatMap((target, i) => Array.from({ length: Number(counts[i]) }, (_, id) => ({ target, params: [id] })))
  // A lock record reads its token's balanceOf live, so a token whose balanceOf reverts fails only its
  // own record. Skip that record rather than fail the whole adapter.
  const locks = await api.multiCall({ abi, calls, permitFailure: true })
  return locks.filter(Boolean)
}

// A position id outlives its lock, and a lock's owner can rescue stray NFTs sent to it, so count only
// each lock's recorded position, and only while the lock still owns it.
async function lockedPositionIds(api, nftAddress, positions) {
  const owners = await api.multiCall({
    abi: 'function ownerOf(uint256) view returns (address)',
    calls: positions.map((p) => ({ target: nftAddress, params: [p.id] })),
    permitFailure: true,
  })
  return positions.filter((p, i) => owners[i]?.toLowerCase() === p.lock.toLowerCase()).map((p) => p.id)
}

async function tvl(api) {
  const { v1 = [], v2 = [] } = config[api.chain]
  const ownerTokens = []
  const v3Positions = {} // position manager -> [{ id, lock }]
  const v4Positions = {}

  for (const lock of await readLocks(api, v1, LOCK_DATA_V1)) ownerTokens.push([[lock.token], lock.contractAddress])

  for (const lock of await readLocks(api, v2, LOCK_DATA_V2)) {
    const kind = Number(lock.kind)
    const position = { id: lock.tokenId, lock: lock.contractAddress }
    if (kind === UNIV3) (v3Positions[lock.asset] ??= []).push(position)
    else if (kind === UNIV4) (v4Positions[lock.asset] ??= []).push(position)
    else ownerTokens.push([[lock.asset], lock.contractAddress])
  }

  await sumTokens2({ api, ownerTokens, resolveLP: true })

  for (const [nftAddress, positions] of Object.entries(v3Positions)) {
    const positionIds = await lockedPositionIds(api, nftAddress, positions)
    if (positionIds.length) await sumTokens2({ api, resolveUniV3: true, uniV3ExtraConfig: { nftAddress, positionIds } })
  }

  for (const [nftAddress, positions] of Object.entries(v4Positions)) {
    const positionIds = await lockedPositionIds(api, nftAddress, positions)
    // unwrapUniswapV4NFTs returns its own balances object rather than adding to api, so add it in.
    if (positionIds.length) api.addBalances(await unwrapUniswapV4NFTs({ api, nftAddress, uniV4ExtraConfig: { positionIds } }))
  }

  for (const key of Object.keys(api.getBalances())) {
    if (!QUOTE_TOKENS.has(key.split(':').pop().toLowerCase())) api.removeTokenBalance(key)
  }
}

module.exports = {
  methodology:
    'Counts the assets held by every Titan Locker lock contract on Robinhood Chain. Each lock is its own ' +
    'contract created by a Titan Locker manager; lock records are read on chain to find each lock contract and its asset. ' +
    'ERC-20 and Uniswap V2 LP balances are read with balanceOf (LP tokens are unwrapped into their underlying tokens), ' +
    'and each lock\'s recorded Uniswap V3 or V4 position is valued from its liquidity while the lock still owns it. ' +
    'Only the ETH, WETH, USDG and USDe side is counted; locked project tokens and the project-token legs of LP positions are excluded. ' +
    'Withdrawn locks hold nothing and stop counting automatically.',
  doublecounted: true,
  robinhood: { tvl },
}
