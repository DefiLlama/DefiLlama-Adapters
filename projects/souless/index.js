const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Souless launches markets against USDC on Arc and permanently locks every Uniswap v3 LP NFT.
// Direct launches have one position; guarded launches spread the liquidity over five positions.
const LAUNCH_REGISTRY = '0x4665EbBdD68427A5fDA9700Ac95Fe098aAB5fcFa'
const DIRECT_LOCKER = '0xd0905DB594A9281aC1bC64204cce340eE0241E0D'
const GUARDED_LOCKER = '0x2275A163611932e3BEd4110d67302226ee1A283e'
const POSITION_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'
const DEPLOYMENT_BLOCK = 20146265

const LAUNCH_REGISTERED = 'event LaunchRegistered(bytes32 indexed launchId, address indexed issuer, address indexed token, address pool, address lpLocker, uint256 lpTokenId, bytes32 policyVersionHash, bytes32 metadataCommitment, bytes32 namespaceKey, address referrer, uint16 referralShareBps, uint64 referralExpiresAt, bool narrativeProtectionRequested)'
const POSITION_IDS = 'function positionIds(bytes32 launchId) view returns (uint256[])'

async function tvl(api) {
  const launches = await getLogs({
    api,
    target: LAUNCH_REGISTRY,
    eventAbi: LAUNCH_REGISTERED,
    fromBlock: DEPLOYMENT_BLOCK,
    onlyArgs: true,
  })

  const directPositionIds = launches
    .filter(({ lpLocker }) => lpLocker.toLowerCase() === DIRECT_LOCKER.toLowerCase())
    .map(({ lpTokenId }) => lpTokenId)

  const guardedLaunchIds = launches
    .filter(({ lpLocker }) => lpLocker.toLowerCase() === GUARDED_LOCKER.toLowerCase())
    .map(({ launchId }) => launchId)

  const guardedPositionIds = guardedLaunchIds.length
    ? (await api.multiCall({
        target: GUARDED_LOCKER,
        abi: POSITION_IDS,
        calls: guardedLaunchIds,
      })).flat()
    : []

  const positionIds = [...directPositionIds, ...guardedPositionIds]
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
  methodology: 'TVL is the USDC side of every permanently locked Uniswap v3 position created by a finalized Souless launch. Launches are enumerated from the canonical LaunchRegistry. Direct launches contribute their single registered LP NFT; guarded launches contribute all LP NFT ids returned by the guarded locker. The launched-token side and uncollected fees are excluded to avoid reflexive valuation. Marked doublecounted because these positions are also part of the underlying Uniswap v3 TVL on Arc.',
  doublecounted: true,
  start: '2026-09-10',
  arc: { tvl },
}
