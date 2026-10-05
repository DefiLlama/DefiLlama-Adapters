const { sumTokens2, unwrapUniswapV4NFTs } = require('../helper/unwrapLPs')

/* Titan Locker, a token, LP, Uniswap V3/V4 position and vesting locker on
 * Robinhood Chain.
 *
 * Every lock is its own contract, created by a manager. TVL is what those lock
 * contracts hold right now: ERC-20 and Uniswap V2 LP balances read with
 * balanceOf, Uniswap V3 positions owned by a lock contract, and Uniswap V4
 * positions still owned by their lock. A withdrawn lock holds nothing, so it
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
  return api.multiCall({ abi, calls })
}

async function tvl(api) {
  const { v1 = [], v2 = [] } = config[api.chain]
  const ownerTokens = []
  const v3Owners = {} // position manager -> lock contracts
  const v4Positions = {} // position manager -> [{ id, lock }]

  for (const lock of await readLocks(api, v1, LOCK_DATA_V1)) ownerTokens.push([[lock.token], lock.contractAddress])

  for (const lock of await readLocks(api, v2, LOCK_DATA_V2)) {
    const kind = Number(lock.kind)
    if (kind === UNIV3) (v3Owners[lock.asset] ??= []).push(lock.contractAddress)
    else if (kind === UNIV4) (v4Positions[lock.asset] ??= []).push({ id: lock.tokenId, lock: lock.contractAddress })
    else ownerTokens.push([[lock.asset], lock.contractAddress])
  }

  await sumTokens2({ api, ownerTokens, resolveLP: true })

  for (const [nftAddress, owners] of Object.entries(v3Owners))
    await sumTokens2({ api, owners, resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })

  // A V4 position id outlives its lock, so count only positions still owned by the lock contract.
  for (const [nftAddress, positions] of Object.entries(v4Positions)) {
    const owners = await api.multiCall({
      abi: 'function ownerOf(uint256) view returns (address)',
      calls: positions.map((p) => ({ target: nftAddress, params: [p.id] })),
      permitFailure: true,
    })
    const positionIds = positions.filter((p, i) => owners[i]?.toLowerCase() === p.lock.toLowerCase()).map((p) => p.id)
    // unwrapUniswapV4NFTs returns its own balances object rather than adding to api, so add it in.
    if (positionIds.length) api.addBalances(await unwrapUniswapV4NFTs({ api, nftAddress, uniV4ExtraConfig: { positionIds } }))
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'Counts the assets held by every Titan Locker lock contract on Robinhood Chain. Each lock is its own ' +
    'contract created by a Titan Locker manager; lock records are read on chain to find each lock contract and its asset. ' +
    'ERC-20 and Uniswap V2 LP balances are read with balanceOf (LP tokens are unwrapped into their underlying tokens), ' +
    'Uniswap V3 positions owned by a lock contract are valued from their liquidity, and Uniswap V4 positions are counted ' +
    'only while still owned by their lock. Withdrawn locks hold nothing and stop counting automatically.',
  robinhood: { tvl },
}
