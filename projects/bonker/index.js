const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const TOKEN_REWARD_ADDED_EVENT =
  'event TokenRewardAdded(address token, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 poolSupply, uint256 positionId, uint256 numPositions, uint16[] rewardBps, address[] rewardAdmins, address[] rewardRecipients, int24[] tickLower, int24[] tickUpper, uint16[] positionBps)'

const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

// The factory's setLocker() only ever adds a locker, never replaces one — an already-launched
// token keeps the locker it was registered with, so a chain can have more than one locker live
// at once across its history. Summing only the current locker would silently drop every position
// held by a superseded one, which is exactly what happened on Robinhood Chain's 2026-09-09
// redeploy (the old locker's fee-conversion swap couldn't decode that chain's forked router, but
// it kept every liquidity position it already held).
function tvlForChain({ lockers, positionManager, weth, startBlock }) {
  return async (api) => {
    const allLockedPositionIds = []

    for (const locker of lockers) {
      const launches = await getLogs2({
        api,
        target: locker,
        eventAbi: TOKEN_REWARD_ADDED_EVENT,
        fromBlock: startBlock,
      })

      const positionIds = [
        ...new Set(
          launches.flatMap(({ positionId, numPositions }) =>
            Array.from({ length: Number(numPositions) }, (_, i) =>
              (BigInt(positionId) + BigInt(i)).toString(),
            ),
          ),
        ),
      ]
      if (!positionIds.length) continue

      const owners = await api.multiCall({
        target: positionManager,
        abi: OWNER_OF_ABI,
        calls: positionIds,
        permitFailure: true,
      })
      positionIds.forEach((id, i) => {
        if (owners[i]?.toLowerCase() === locker.toLowerCase()) allLockedPositionIds.push(id)
      })
    }

    if (!allLockedPositionIds.length) return {}

    return sumTokens2({
      api,
      resolveUniV4: true,
      uniV4ExtraConfig: {
        positionIds: allLockedPositionIds,
        whitelistedTokens: [weth],
      },
    })
  }
}

module.exports = {
  methodology:
    'Counts the WETH side of Uniswap V4 liquidity positions created by the Bonker factory and permanently held by a Bonker LP locker. Positions are enumerated on-chain from TokenRewardAdded events, and launchpad-minted tokens are excluded to avoid circular pricing. A chain can have more than one locker across its history since setLocker() only adds, never replaces, so every locker that has ever been live on a chain is summed.',
  start: '2026-03-06',
  doublecounted: true,
  base: {
    tvl: tvlForChain({
      lockers: ['0xBf05b1d5E356f3219D0086A4e09c969ADbe2e7d0'],
      positionManager: '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
      weth: ADDRESSES.base.WETH,
      startBlock: 43_000_832,
    }),
  },
  robinhood: {
    tvl: tvlForChain({
      lockers: [
        // Superseded 2026-09-09 (issue #762) — stays enabled for tokens launched before the fix,
        // so its positions are still locked TVL, not orphaned.
        '0xae2a15309cd4401AF710CE014ec61246a7706B08',
        // Live locker for new launches since the redeploy.
        '0x97d863C592ffe30c8D8621c869f143cF34F18A9D',
      ],
      positionManager: '0x58daec3116aae6d93017baaea7749052e8a04fa7',
      weth: ADDRESSES.robinhood.WETH,
      startBlock: 53_621_593,
    }),
  },
}
