const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Wonk Fun launchpad on Arc. Every launch is a Uniswap V4 pool behind the Wonk hook: the factory
// mints the main band to the hook and the tail band to the locker, and graduation burns the main
// band and re-pools the raise as a permanently locked position in the locker.
// TVL is the base-asset side of those positions, valued in whatever the pool raised (native USDC,
// or WONK for launches quoted in it). Launched tokens are never counted, including WONK's own
// supply sitting in the WONK/USDC launch pool.
const FACTORY = '0x34f3DA4D04394173DED7b0f430af114a0fF27952'
const HOOK = '0x21bdc377265e2A26ba336F24381E67e768253044'
const LOCKER = '0x0a787cF22782418381D4A5eEf0C492Acb5cC4839'
const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const WONK = '0x548Df4bF91624D8cEC46d606211EB13f7492e27E'
const FIRST_LAUNCH_BLOCK = 21294374

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold, bytes32 poolId, uint256 mainBandTokenId, uint256 tailBandTokenId, string name, string symbol, uint256 totalSupply, uint128 startAmount, uint16 taxBps, uint8 baseDecimals)'
const POSITION_LOCKED = 'event PositionLocked(address indexed token, uint256 indexed tokenId)'

async function positionsByBase(api) {
  // The V4 PositionManager has no enumeration, so ids come from the protocol's own events: the main
  // and tail bands from the factory's launch record, the graduated position from the locker.
  const launches = await getLogs2({ api, target: FACTORY, fromBlock: FIRST_LAUNCH_BLOCK, eventAbi: TOKEN_LAUNCHED })
  const locked = await getLogs2({ api, target: LOCKER, fromBlock: FIRST_LAUNCH_BLOCK, eventAbi: POSITION_LOCKED })

  // base asset per position, so each pool is only ever valued in the asset it raised
  const baseOfToken = {}
  const baseOfId = {}
  for (const l of launches) {
    const base = l.pairToken.toLowerCase()
    baseOfToken[l.token.toLowerCase()] = base
    baseOfId[l.mainBandTokenId.toString()] = base
    baseOfId[l.tailBandTokenId.toString()] = base
  }
  for (const l of locked) baseOfId[l.tokenId.toString()] = baseOfToken[l.token.toLowerCase()]

  // re-verified with ownerOf, which also drops main bands burned at graduation
  const ids = Object.keys(baseOfId)
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const held = new Set([HOOK, LOCKER].map(i => i.toLowerCase()))
  const idsByBase = {}
  ids.forEach((id, i) => {
    if (!held.has(owners[i]?.toLowerCase())) return
    const base = baseOfId[id]
    if (!base) return
    if (!idsByBase[base]) idsByBase[base] = []
    idsByBase[base].push(id)
  })
  return idsByBase
}

// WONK is the protocol's own token, so launches quoted in it are reported as staking
const sumBase = (isWonk) => async (api) => {
  const idsByBase = await positionsByBase(api)
  for (const [base, positionIds] of Object.entries(idsByBase)) {
    if ((base === WONK.toLowerCase()) !== isWonk) continue
    await sumTokens2({
      api, resolveUniV4: true,
      uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens: [base] },
    })
  }
}

module.exports = {
  methodology: 'TVL is the base-asset side of the Uniswap V4 launch positions held by the Wonk hook (the live bonding-curve band) and permanently locked in the Wonk locker (the tail band and the graduated position), each pool valued in the asset it raised. Launches quoted in native USDC are counted as TVL; launches quoted in WONK, the protocol\'s own token, are counted as staking. Position ids come from the factory and locker events and are re-verified with ownerOf. Launched tokens and uncollected fees are excluded. Marked doublecounted because the positions already sit inside Uniswap V4 TVL on Arc.',
  doublecounted: true,
  arc: {
    tvl: sumBase(false),
    staking: sumBase(true),
  },
}
