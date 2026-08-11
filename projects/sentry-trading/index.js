const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// TVL is the liquidity held in those launch pools. Two generations exist
// and both are live, so both are counted:
//
//   v3 — the original factory. LP is a Uniswap V3 NFT locked in the
//        factory; the pool contract itself custodies the tokens, so the
//        pool balances are the TVL.
//   v4 — the current factory. Uniswap V4 has no per-pool contract and no
//        LP NFT: every pool's funds sit commingled in the PoolManager
//        singleton and the position is a mapping entry owned by the
//        factory (older launches) or the immutable SentryLPVault (current
//        launches). Pool balances therefore cannot be read directly, so
//        each position's reserves are derived from its liquidity, tick
//        range, and the pool's current price.

const CONFIG = {
  robinhood: {
    // [factory, first block] — PoolInitialized(pool, token)
    v3Factories: [['0x9e8f6f8214b01Fd4Cf1d73FB1fb7cf9f811036Cb', 1431636]],
    // [factory, first block] — TokenDeployed(token, name, symbol, creator, poolId)
    v4Factories: [
      ['0x472286b7d5c1b2a3ce1132ef73d3bccf446c5cc1', 12274076], // WETH bases
      ['0xd0A93885a387e3a8a14dd82776CF9104a3676b3A', 13991230], // tokenized-stock bases
    ],
    stateView: '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b',
    vault: '0x0F0E601041Ec765B8bAB8c166840E291253F2Df0',
    weth: ADDRESSES.robinhood.WETH,
  },
  ink: {
    v3Factories: [
      ['0xDc37e11B68052d1539fa23386eE58Ac444bf5BE1', 39943151],
      ['0x733733E8eAbB94832847AbF0E0EeD6031c3EB2E4', 40126112], // agent launches
    ],
    v4Factories: [['0xcF44b151aee1Ef69677f24cadED4d2d61b0D45BD', 52014353]],
    stateView: '0x76fd297e2d437cd7f76d50f01afe6160f86e9990',
    vault: '0x86585D4474C78c1C0fA1f8771682E9aD020787eC',
    weth: ADDRESSES.ink.WETH,
  },
}

const ABI = {
  poolInitialized: 'event PoolInitialized(address indexed pool, address indexed token)',
  tokenDeployedV4: 'event TokenDeployed(address indexed token, string name, string symbol, address indexed creator, bytes32 indexed poolId)',
  launches: 'function launches(address) view returns (address baseToken, address creator, address hook, int24 tickLower, int24 tickUpper)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo: 'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

// Sentry mints v4 liquidity with a zero salt, so a position's key is just
// (owner, tickLower, tickUpper); getPositionInfo hashes it on-chain.
const ZERO_SALT = '0x' + '0'.repeat(64)

async function v3Tvl(api, config) {
  const ownerTokens = []
  for (const [factory, fromBlock] of config.v3Factories) {
    const logs = await getLogs2({
      api,
      target: factory,
      eventAbi: ABI.poolInitialized,
      fromBlock,
    })
    for (const log of logs) {
      ownerTokens.push([[config.weth], log.pool])
    }
  }
  if (ownerTokens.length) await sumTokens2({ api, ownerTokens })
}

async function v4Tvl(api, config) {
  if (!config.v4Factories?.length) return

  // 1. Enumerate launches. Each factory records its own pools, so the
  //    lookup below has to stay grouped by the factory that owns them.
  const launches = []
  for (const [factory, fromBlock] of config.v4Factories) {
    const logs = await getLogs2({
      api,
      target: factory,
      eventAbi: ABI.tokenDeployedV4,
      fromBlock,
    })
    for (const log of logs) launches.push({ factory, token: log.token, poolId: log.poolId })
  }
  if (!launches.length) return

  // 2. Base asset and tick range per launch.
  const info = await api.multiCall({
    abi: ABI.launches,
    calls: launches.map((l) => ({ target: l.factory, params: [l.token] })),
    permitFailure: true,
  })

  const live = []
  launches.forEach((l, i) => {
    const d = info[i]
    if (!d || !d.baseToken || d.baseToken === ADDRESSES.null) return
    live.push({ ...l, baseToken: d.baseToken, tickLower: Number(d.tickLower), tickUpper: Number(d.tickUpper) })
  })
  if (!live.length) return

  // 3. Current price/tick per pool.
  const slot0 = await api.multiCall({
    abi: ABI.getSlot0,
    target: config.stateView,
    calls: live.map((l) => ({ params: [l.poolId] })),
    permitFailure: true,
  })

  // 4. Position liquidity. Custody is the vault for current launches and the
  //    factory for older ones, so both owners are probed (a launch sits in one;
  //    the other reads 0). Sentry mints with a zero salt, so getPositionInfo
  //    derives the position key from (owner, ticks) on-chain.
  const ownerCalls = (owner) => live.map((l) => ({
    target: config.stateView,
    params: [l.poolId, owner(l), l.tickLower, l.tickUpper, ZERO_SALT],
  }))
  const [vaultLiq, factoryLiq] = await Promise.all([
    api.multiCall({ abi: ABI.getPositionInfo, calls: ownerCalls(() => config.vault), permitFailure: true }),
    api.multiCall({ abi: ABI.getPositionInfo, calls: ownerCalls((l) => l.factory), permitFailure: true }),
  ])

  // 5. Derive reserves. v4 orders currencies by address, exactly as v3 does.
  live.forEach((l, i) => {
    const s = slot0[i]
    if (!s || !s.sqrtPriceX96 || s.sqrtPriceX96 === '0') return

    const liquidity = Number(vaultLiq[i]?.liquidity || 0) + Number(factoryLiq[i]?.liquidity || 0)
    if (!liquidity) return

    const tokenIsCurrency0 = l.token.toLowerCase() < l.baseToken.toLowerCase()
    const [token0, token1] = tokenIsCurrency0 ? [l.token, l.baseToken] : [l.baseToken, l.token]

    // Add full position then drop the launch token's side
    addUniV3LikePosition({
      api,
      token0,
      token1,
      liquidity,
      tickLower: l.tickLower,
      tickUpper: l.tickUpper,
      tick: Number(s.tick),
    })
    api.removeTokenBalance(l.token)
  })
}

async function tvl(api) {
  const config = CONFIG[api.chain]
  await v3Tvl(api, config)
  await v4Tvl(api, config)
}

module.exports = {
  methodology: "TVL is the base-asset liquidity held in the pools created by the Sentry Launch Factory, across both live generations, on Robinhood Chain and Ink. v3 launches hold liquidity in a Uniswap V3 pool contract whose LP NFT is permanently locked in the factory, so the WETH balance of each pool is counted directly. v4 launches have no per-pool contract: funds sit in the Uniswap V4 PoolManager singleton and the position is owned by the factory or by the immutable SentryLPVault, so each position's base-asset reserve is derived from its liquidity, tick range and the pool's current price. Both WETH-paired and tokenized-stock-paired launches are included. The launched token's own side of the pair is excluded, since its only market is the pool being measured.",
  doublecounted: true,
  start: '2026-07-02',
  robinhood: { tvl },
  ink: { tvl },
}
