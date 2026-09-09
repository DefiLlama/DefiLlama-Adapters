const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

/*
 * PHERA — CLMM DEX and launchpad on Robinhood Chain (chainId 4663).
 *
 * Two venue types, counted differently on purpose:
 *
 *   1. BONDING CURVES, created by a LaunchFactory. QUOTE SIDE ONLY. A curve also holds the launch token's
 *      unsold inventory, which it minted for itself and which nobody deposited — counting it would inflate
 *      TVL by orders of magnitude, so it is excluded.
 *
 *   2. CL POOLS, created by a PheraCLFactory. Both sides, the ordinary AMM convention.
 *
 * Both factory types emit a Uniswap V3-shaped PoolCreated. Two generations of the protocol are live on the
 * chain (the generation-1 factories are retired but their venues still custody whatever remains in them),
 * so each list carries both.
 */

const LAUNCH_FACTORIES = [
  { target: '0xD3504c3A32467e5e3c988AaF500Dd689285c587E', fromBlock: 45979598 }, // generation 2 (live)
  { target: '0x068463559F05379077aE3deD37cC55cDBB3d6Bb2', fromBlock: 37410616 }, // generation 1 (retired)
]
const CL_FACTORIES = [
  { target: '0x185f43b9E3e956798b7b9CF0a4FE00463aEe064B', fromBlock: 45979598 }, // generation 2 (live)
  { target: '0xA7e3cBf3A9F12da335531e1dd986B616b6d6ed7c', fromBlock: 37410605 }, // generation 1 (retired)
]

const POOL_CREATED =
  'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'

async function tvl(api) {
  const [curveLogsA, curveLogsB, poolLogsA, poolLogsB] = await Promise.all([
    getLogs2({ api, target: LAUNCH_FACTORIES[0].target, eventAbi: POOL_CREATED, fromBlock: LAUNCH_FACTORIES[0].fromBlock }),
    getLogs2({ api, target: LAUNCH_FACTORIES[1].target, eventAbi: POOL_CREATED, fromBlock: LAUNCH_FACTORIES[1].fromBlock }),
    getLogs2({ api, target: CL_FACTORIES[0].target, eventAbi: POOL_CREATED, fromBlock: CL_FACTORIES[0].fromBlock }),
    getLogs2({ api, target: CL_FACTORIES[1].target, eventAbi: POOL_CREATED, fromBlock: CL_FACTORIES[1].fromBlock }),
  ])
  const curveLogs = [...curveLogsA, ...curveLogsB]
  const poolLogs = [...poolLogsA, ...poolLogsB]

  const curves = curveLogs.map(i => i.pool)
  // token0/token1 are sorted by ADDRESS, so neither side can be assumed to be the quote — it is read from the
  // curve itself. A curve that has already graduated (state 3) has moved its reserves into a pool below and
  // would otherwise be counted twice.
  const [states, quotes] = await Promise.all([
    api.multiCall({ abi: 'uint8:state', calls: curves }),
    api.multiCall({ abi: 'address:quoteToken', calls: curves }),
  ])

  const owners = []
  const tokens = []
  curves.forEach((curve, i) => {
    const state = Number(states[i])
    if (state !== 1 && state !== 2) return // 1 CurveActive, 2 Graduating
    owners.push(curve)
    tokens.push(quotes[i])
  })

  const poolTokens = poolLogs.flatMap(i => [i.token0, i.token1])
  const poolOwners = poolLogs.flatMap(i => [i.pool, i.pool])

  return sumTokens2({
    api,
    tokensAndOwners: [
      ...owners.map((owner, i) => [tokens[i], owner]),
      ...poolOwners.map((owner, i) => [poolTokens[i], owner]),
    ],
  })
}

module.exports = {
  methodology:
    'TVL is the quote-asset balance held by every active PHERA bonding curve plus both sides of every '
    + 'PheraCLFactory pool. Unsold launch-token inventory sitting in a curve is excluded: it was minted by '
    + 'the curve itself and never deposited by anyone.',
  start: 1786000000,
  robinhood: { tvl },
}
