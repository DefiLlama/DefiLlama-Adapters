const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const CONFIG = {
  base: {
    lpLockers: [
      {
        address: '0xBf05b1d5E356f3219D0086A4e09c969ADbe2e7d0',
        startBlock: 43_000_832,
      },
    ],
    positionManager: '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
    weth: ADDRESSES.base.WETH,
  },
  robinhood: {
    // Existing positions remain owned by this locker after its successor is deployed,
    // so historical lockers must stay in the list when a new one is added.
    lpLockers: [
      {
        address: '0xae2a15309cd4401AF710CE014ec61246a7706B08',
        startBlock: 53_621_593,
      },
    ],
    positionManager: '0x58daec3116aae6d93017baaea7749052e8a04fa7',
    weth: ADDRESSES.robinhood.WETH,
  },
}

const TOKEN_REWARD_ADDED_EVENT =
  'event TokenRewardAdded(address token, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 poolSupply, uint256 positionId, uint256 numPositions, uint16[] rewardBps, address[] rewardAdmins, address[] rewardRecipients, int24[] tickLower, int24[] tickUpper, uint16[] positionBps)'

const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

const tvl = async (api) => {
  const config = CONFIG[api.chain]
  const positionIdsByLocker = await Promise.all(
    config.lpLockers.map(async ({ address, startBlock }) => {
      const launches = await getLogs2({
        api,
        target: address,
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
      if (!positionIds.length) return []

      const owners = await api.multiCall({
        target: config.positionManager,
        abi: OWNER_OF_ABI,
        calls: positionIds,
        permitFailure: true,
      })
      return positionIds.filter(
        (_, i) => owners[i]?.toLowerCase() === address.toLowerCase(),
      )
    }),
  )
  const lockedPositionIds = [...new Set(positionIdsByLocker.flat())]
  if (!lockedPositionIds.length) return {}

  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: lockedPositionIds,
      whitelistedTokens: [config.weth],
    },
  })
}

module.exports = {
  methodology:
    'Counts the WETH side of Uniswap V4 liquidity positions created by the Bonker factory on Base and Robinhood Chain and permanently held by Bonker LP lockers. Positions are enumerated on-chain from TokenRewardAdded events, and launchpad-minted tokens are excluded to avoid circular pricing.',
  start: '2026-03-06',
  doublecounted: true,
  base: { tvl },
  robinhood: { tvl },
}
