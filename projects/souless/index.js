const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Souless launches markets against USDC on Arc and permanently locks every Uniswap v3 LP NFT.
// Direct launches have one position; guarded launches spread the liquidity over five positions.
const DIRECT_LOCKER = '0xd0905DB594A9281aC1bC64204cce340eE0241E0D'
const GUARDED_LOCKER = '0x2275A163611932e3BEd4110d67302226ee1A283e'
const POSITION_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'
const LAUNCH_REGISTRY = '0x4665EbBdD68427A5fDA9700Ac95Fe098aAB5fcFa'
const ZERO_BYTES32 = `0x${'0'.repeat(64)}`

const GET_LAUNCH = 'function getLaunch(bytes32 launchId) view returns (tuple(address issuer, address governanceWallet, address token, address pool, address lpLocker, uint256 lpTokenId, uint64 launchedAt, bytes32 policyVersionHash, bytes32 metadataCommitment, bytes32 namespaceKey, address referrer, uint16 referralShareBps, uint64 referralExpiresAt, bool narrativeProtectionRequested, bool creatorGovernanceCommitted, bool communityModeEnabled))'
const LAUNCH_FOR_POSITION = 'function launchForPosition(uint256 tokenId) view returns (bytes32)'

async function getFinalizedPositionIds(api, locker) {
  const balance = await api.call({ target: POSITION_MANAGER, abi: 'erc20:balanceOf', params: locker })
  if (!Number(balance)) return []

  const positionIds = await api.multiCall({
    target: POSITION_MANAGER,
    abi: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    calls: Array.from({ length: Number(balance) }, (_, index) => ({ params: [locker, index] })),
  })
  const launchIds = await api.multiCall({ target: locker, abi: LAUNCH_FOR_POSITION, calls: positionIds })
  const validEntries = launchIds
    .map((launchId, index) => ({ launchId, positionId: positionIds[index] }))
    .filter(({ launchId }) => launchId !== ZERO_BYTES32)
  if (!validEntries.length) return []

  const launches = await api.multiCall({
    target: LAUNCH_REGISTRY,
    abi: GET_LAUNCH,
    calls: validEntries.map(({ launchId }) => launchId),
  })

  return validEntries
    .filter(({ positionId }, index) => {
      const launch = launches[index]
      if (launch.lpLocker.toLowerCase() !== locker.toLowerCase()) return false
      return locker !== DIRECT_LOCKER || String(launch.lpTokenId) === String(positionId)
    })
    .map(({ positionId }) => positionId)
}

async function tvl(api) {
  const positionIds = (
    await Promise.all([
      getFinalizedPositionIds(api, DIRECT_LOCKER),
      getFinalizedPositionIds(api, GUARDED_LOCKER),
    ])
  ).flat()
  if (!positionIds.length) return

  return sumTokens2({
    api,
    uniV3ExtraConfig: { nftAddress: POSITION_MANAGER, positionIds },
    // The launched token has no independent price source: counting it at the price of the same
    // pool being measured would make TVL reflexive. Only the USDC side is therefore included.
    uniV3WhitelistedTokens: [ADDRESSES.arc.USDC],
  })
}

module.exports = {
  methodology: 'TVL is the USDC side of every finalized Souless Uniswap v3 position held by the immutable direct and guarded permanent LP lockers. Current locker holdings are verified against each locker\'s launch-to-position registration and the canonical LaunchRegistry, avoiding both unsolicited NFTs and archive-log dependencies. The launched-token side and uncollected fees are excluded to avoid reflexive valuation. Marked doublecounted because these positions are also part of the underlying Uniswap v3 TVL on Arc.',
  doublecounted: true,
  start: '2026-09-10',
  arc: { tvl },
}
