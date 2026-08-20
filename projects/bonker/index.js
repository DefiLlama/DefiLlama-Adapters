const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const LP_LOCKER = '0xBf05b1d5E356f3219D0086A4e09c969ADbe2e7d0'
const POSITION_MANAGER = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const START_BLOCK = 43_000_832

const TOKEN_REWARD_ADDED_EVENT =
  'event TokenRewardAdded(address token, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 poolSupply, uint256 positionId, uint256 numPositions, uint16[] rewardBps, address[] rewardAdmins, address[] rewardRecipients, int24[] tickLower, int24[] tickUpper, uint16[] positionBps)'

const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

const tvl = async (api) => {
  const launches = await getLogs2({
    api,
    target: LP_LOCKER,
    eventAbi: TOKEN_REWARD_ADDED_EVENT,
    fromBlock: START_BLOCK,
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
  if (!positionIds.length) return {}

  const owners = await api.multiCall({
    target: POSITION_MANAGER,
    abi: OWNER_OF_ABI,
    calls: positionIds,
    permitFailure: true,
  })
  const lockedPositionIds = positionIds.filter(
    (_, i) => owners[i]?.toLowerCase() === LP_LOCKER.toLowerCase(),
  )
  if (!lockedPositionIds.length) return {}

  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: lockedPositionIds,
      whitelistedTokens: [ADDRESSES.base.WETH],
    },
  })
}

module.exports = {
  methodology:
    'Counts the WETH side of Uniswap V4 liquidity positions created by the Bonker factory and permanently held by the Bonker LP locker. Positions are enumerated on-chain from TokenRewardAdded events, and launchpad-minted tokens are excluded to avoid circular pricing.',
  start: '2026-03-06',
  doublecounted: true,
  base: { tvl },
}
