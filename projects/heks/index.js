const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// heks is a coin launchpad on Robinhood Chain. A coin goes straight into a Uniswap V4 pool as a
// single-sided position: the whole supply is placed in a range above the starting price, and the
// pool fills up with the pair asset as people buy.
//
// Deployments differ in who owns that position in the shared PoolManager:
//   - up to V2.1 a vault contract holds it directly, with a zero salt. There is no per-pool contract
//     and no LP NFT, so there is no balance to read: reserves are derived from the position's
//     liquidity, its tick range and the pool's current price. The armsys adapter documents the same
//     constraint — the PoolManager singleton holds every pool's reserves at once, so a single
//     protocol's share cannot be read off its balance;
//   - from V2.2 the position is minted through the Uniswap V4 PositionManager and its NFT is sent to
//     the dead address in the launch transaction, so it can never be withdrawn. In the PoolManager
//     the owner is the PositionManager and the salt is the NFT id, which the launchpad publishes in
//     its LaunchTermsV22 event. The reserves are derived the same way.
//
// https://robinhoodchain.blockscout.com/address/0x0f2005a033c6cA153a06cA80c670E856e494c45A
const LAUNCHPADS = [
  // V2.2: new coins are created here since 2026-09-26; positions are LP NFTs locked at the dead address.
  { launchpad: '0x0f2005a033c6cA153a06cA80c670E856e494c45A', fromBlock: 73071918, lpNft: true },
  // V2.1: vault-held positions.
  { launchpad: '0x3AAB7D1317565d768b92A07b4417B128F470Da68', vault: '0xb7Ab4c5e3d133cfbE4fCd627728849B8E6F0dbF0', fromBlock: 69908367 },
  // Earlier deployments: their positions are locked and still trade, so the liquidity locked in them
  // is still heks liquidity.
  { launchpad: '0x62cA64f87E051a2E190d17caA98E4a08f4a597dc', vault: '0x89c0983D9B01F6CAe4FEcbb6b5D6296b44536400', fromBlock: 62705679 },
  { launchpad: '0x0647b0f4bFDEC1f64ffaD55Edcf24504269058de', vault: '0x3025685BE0c6Fa2Ce7ec3Ed6CdBdAF2E6309638f', fromBlock: 56970549 },
]

// Uniswap V4 StateView and PositionManager on Robinhood Chain — the same deployment other V4
// adapters on this chain already use.
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const POSITION_MANAGER = '0x58daec3116aae6D93017bAAea7749052E8a04fA7'

// Vault-held positions are opened with a zero salt, so their key is just (owner, tickLower, tickUpper).
const ZERO_SALT = '0x' + '0'.repeat(64)

const ABI = {
  tokenCreated:
    'event TokenCreated(address indexed token, address indexed creator, address indexed numeraire, bytes32 poolId, int24 derivedTick, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, int256 feedAnswer, uint256 feedUpdatedAt, uint256 launchFee, uint256 devBuyIn, uint256 devBuyOut, uint256 xKey, uint256 uiMultiplier, string metaURI)',
  launchTerms:
    'event LaunchTermsV22(bytes32 indexed id, address indexed token, address feeRecipient, uint24 basePips, uint24 taxPips, uint24 snipeStartPips, uint32 snipeWindow, uint256 laneStartAmount, uint256 lpTokenId, uint8 exemptionCount, bool feeToHolders, uint256 xKey)',
  getSlot0:
    'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

/**
 * Sums the liquidity heks holds in Uniswap V4 across every coin it has launched.
 *
 * Launches are listed from the launchpads' TokenCreated logs, each position's liquidity is read
 * from Uniswap V4 StateView, and the reserves are derived from that liquidity, the position's tick
 * range and the pool's current price.
 *
 * @param {object} api - DefiLlama chain API for the block being priced.
 */
async function tvl(api) {
  // 1. List the launches. One event carries almost everything needed downstream: both pool
  //    currencies, the pool id and the position's tick range. A V2.2 launch also names its LP NFT
  //    in LaunchTermsV22, emitted in the same transaction.
  const launches = []
  for (const set of LAUNCHPADS) {
    const logs = await getLogs2({
      api,
      target: set.launchpad,
      eventAbi: ABI.tokenCreated,
      fromBlock: set.fromBlock,
      extraKey: set.launchpad,
    })
    let nftOf = {}
    if (set.lpNft) {
      const terms = await getLogs2({
        api,
        target: set.launchpad,
        eventAbi: ABI.launchTerms,
        fromBlock: set.fromBlock,
        extraKey: `${set.launchpad}-terms`,
      })
      nftOf = Object.fromEntries(terms.map((t) => [t.id.toLowerCase(), t.lpTokenId]))
    }
    for (const l of logs) {
      let owner = set.vault
      let salt = ZERO_SALT
      if (set.lpNft) {
        const tokenId = nftOf[l.poolId.toLowerCase()]
        // Both events come from the same create() call, so a launch without its NFT id means the
        // logs were read wrong — fail loudly rather than undercount.
        if (tokenId === undefined) throw new Error(`heks: no LaunchTermsV22 for pool ${l.poolId}`)
        owner = POSITION_MANAGER
        salt = '0x' + BigInt(tokenId).toString(16).padStart(64, '0')
      }
      launches.push({
        token: l.token,
        numeraire: l.numeraire,
        poolId: l.poolId,
        owner,
        salt,
        tickLower: Number(l.tickLower),
        tickUpper: Number(l.tickUpper),
      })
    }
  }
  if (!launches.length) return

  // 2. The pool's current price and the liquidity the PoolManager actually records against the
  //    position. Liquidity comes from Uniswap rather than our own bookkeeping, so the number
  //    reflects what is really there.
  const [slot0, positionInfo] = await Promise.all([
    api.multiCall({
      abi: ABI.getSlot0,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId] })),
    }),
    api.multiCall({
      abi: ABI.getPositionInfo,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId, l.owner, l.tickLower, l.tickUpper, l.salt] })),
    }),
  ])

  // 3. Derive the reserves. V4 orders currencies by address, so a pair with the native coin (the
  //    zero address) always has it as currency0.
  launches.forEach((l, i) => {
    const s = slot0[i]
    if (!s || !s.sqrtPriceX96 || s.sqrtPriceX96 === '0') return

    const liquidity = Number(positionInfo[i]?.liquidity || 0)
    if (!liquidity) return

    const numeraireIsCurrency0 = l.numeraire.toLowerCase() < l.token.toLowerCase()
    const [token0, token1] = numeraireIsCurrency0 ? [l.numeraire, l.token] : [l.token, l.numeraire]

    addUniV3LikePosition({
      api,
      token0,
      token1,
      liquidity,
      tickLower: l.tickLower,
      tickUpper: l.tickUpper,
      tick: Number(s.tick),
    })
  })
}

module.exports = {
  methodology:
    'TVL is the liquidity heks locks in the Uniswap V4 PoolManager across every coin it has launched. Each launch seeds one one-sided position that can never be withdrawn — held by the launchpad vault in earlier deployments, and from V2.2 minted through the Uniswap V4 PositionManager with its NFT sent to the dead address — so the pair asset buyers pay in accumulates there and only fees can leave. Launches are read from the launchpads\' TokenCreated logs, which carry both currencies and the position\'s tick range (V2.2 launches also name their NFT in LaunchTermsV22); the position\'s liquidity is read from Uniswap V4 StateView, and the reserves are derived from that liquidity, the tick range and the pool\'s current price. Both sides of each position are counted, so a launched coin contributes only once it has a price of its own.',
  start: '2026-09-10',
  // These are Uniswap V4 pools, and the same funds are already counted by the uniswap-v4 adapter,
  // which reads raw PoolManager balances on this chain.
  doublecounted: true,
  robinhood: { tvl },
}
