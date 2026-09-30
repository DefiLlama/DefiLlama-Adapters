const { getLogs2 } = require('../helper/cache/getLogs')

// PheraDEX launchpad (phera.pro) on Robinhood Chain. Launch tokens trade on bonding curves created by a
// LaunchFactory until they graduate into PheraDEX CL pools, which are listed separately as `pheradex`.
//
// TVL is the quote asset users have paid into each live curve. Two things a curve holds are excluded:
//   - its unsold launch-token inventory, which the curve minted for itself and nobody deposited;
//   - graduationLiquidityReserve, the LP-fee share and anti-sniper surcharge the curve retains to seed
//     protocol-owned liquidity at graduation. It is fee income, not user deposits.
// quoteBalance == realQuoteReserve + graduationLiquidityReserve holds by construction.
// Graduated curves (state 3) have moved their reserves into a CL pool and are skipped.
const FACTORIES = [
  { target: '0xD3504c3A32467e5e3c988AaF500Dd689285c587E', fromBlock: 45979598 }, // generation 2 (live)
  { target: '0x068463559F05379077aE3deD37cC55cDBB3d6Bb2', fromBlock: 37410616 }, // generation 1 (retired, its curves still custody funds)
]
const POOL_CREATED = 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)'
const LIVE_STATES = [1, 2] // CurveActive, Graduating

async function tvl(api) {
  const logs = (await Promise.all(FACTORIES.map(({ target, fromBlock }) => getLogs2({ api, target, fromBlock, eventAbi: POOL_CREATED })))).flat()
  const curves = logs.map(log => log.pool)
  const [states, quotes] = await Promise.all([
    api.multiCall({ abi: 'uint8:state', calls: curves }),
    api.multiCall({ abi: 'address:quoteToken', calls: curves }),
  ])
  // token0/token1 are address-sorted, so the quote side is read from the curve rather than assumed.
  const live = curves
    .map((curve, i) => ({ curve, quote: quotes[i], state: Number(states[i]) }))
    .filter(({ state }) => LIVE_STATES.includes(state))
  const [balances, reserves] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: live.map(({ curve, quote }) => ({ target: quote, params: curve })) }),
    api.multiCall({ abi: 'uint256:graduationLiquidityReserve', calls: live.map(({ curve }) => curve) }),
  ])
  live.forEach(({ curve, quote }, i) => {
    const amount = BigInt(balances[i]) - BigInt(reserves[i])
    if (amount < 0n) throw new Error(`PheraDEX curve fee reserve exceeds its quote balance: ${curve}`)
    api.add(quote, amount.toString())
  })
}

module.exports = {
  methodology: 'Quote-asset deposits held by every live PheraDEX bonding curve, net of the graduation liquidity reserve the curve retains from trading fees. Unsold launch-token inventory minted by the curve itself is excluded, as are curves that have graduated into PheraDEX CL pools.',
  start: '2026-08-15',
  robinhood: { tvl },
}
