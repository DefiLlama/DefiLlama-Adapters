const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x0e54a12db2d6b8f309269ef98f8b9c2764aa3a92'
const LIQUIDITY_VAULT = '0x4c693C74eDf24520154D5AC0AF35a8aB5530B663'
const START_BLOCK = 66_552_064

const CURVE_CREATED_EVENT = [
  'event CurveCreated(',
  'address indexed curve, ',
  'address indexed token, ',
  'address indexed quoteToken, ',
  'address creator, ',
  'uint256 curveAllocation, ',
  'uint256 liquidityReserve, ',
  'uint256 startingPrice, ',
  'uint256 slope, ',
  'uint256 graduationThreshold, ',
  'uint8 tokenDecimals',
  ')',
].join('')

const LIQUIDITY_SEEDED_EVENT = [
  'event LiquiditySeeded(',
  'address indexed curve, ',
  'address indexed pair, ',
  'address indexed token, ',
  'address quoteToken, ',
  'uint256 tokenAmount, ',
  'uint256 quoteAmount, ',
  'uint256 liquidity',
  ')',
].join('')

const CURVE_STATE_ABI = 'uint8:curveState'
const QUOTE_RESERVE_ABI = 'uint256:quoteReserve'
const GRADUATION_ROUTER_ABI = 'address:GRADUATION_ROUTER'

const TOKEN0_ABI = 'address:token0'
const TOKEN1_ABI = 'address:token1'
const TOTAL_SUPPLY_ABI = 'uint256:totalSupply'

const BALANCE_OF_ABI =
  'function balanceOf(address) view returns (uint256)'

const GET_RESERVES_ABI = [
  'function getReserves() view returns (',
  'uint112 _reserve0, ',
  'uint112 _reserve1, ',
  'uint32 _blockTimestampLast',
  ')',
].join('')

const GRADUATED = 3

async function tvl(api) {
  const curves = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: CURVE_CREATED_EVENT,
    fromBlock: START_BLOCK,
  })

  if (!curves.length) return

  const curveAddresses = curves.map(({ curve }) => curve)

  const [states, quoteReserves] = await Promise.all([
    api.multiCall({
      abi: CURVE_STATE_ABI,
      calls: curveAddresses,
    }),

    api.multiCall({
      abi: QUOTE_RESERVE_ABI,
      calls: curveAddresses,
    }),
  ])

  /*
   * Active bonding curves
   *
   * Only externally contributed quote assets are counted.
   * Relaunched-token inventory is deliberately excluded.
   */
  curves.forEach(({ quoteToken }, i) => {
    if (Number(states[i]) === GRADUATED) return

    const quoteReserve = BigInt(quoteReserves[i])

    if (quoteReserve > 0n) {
      api.add(quoteToken, quoteReserve.toString())
    }
  })

  /*
   * Graduated markets
   *
   * Graduation creates a V2-style AMM pair and mints its LP tokens
   * directly to DaWabLauncher's permanent ProtocolLiquidityVault.
   *
   * We count only the quote-token share represented by the LP tokens
   * currently held by that vault.
   */
  const graduationRouter = await api.call({
    target: FACTORY,
    abi: GRADUATION_ROUTER_ABI,
  })

  const seededLiquidity = await getLogs2({
    api,
    target: graduationRouter,
    eventAbi: LIQUIDITY_SEEDED_EVENT,
    fromBlock: START_BLOCK,
  })

  if (!seededLiquidity.length) return

  const pairs = seededLiquidity.map(({ pair }) => pair)

  const [
    token0s,
    token1s,
    reserves,
    totalSupplies,
    lockedLpBalances,
  ] = await Promise.all([
    api.multiCall({
      abi: TOKEN0_ABI,
      calls: pairs,
    }),

    api.multiCall({
      abi: TOKEN1_ABI,
      calls: pairs,
    }),

    api.multiCall({
      abi: GET_RESERVES_ABI,
      calls: pairs,
    }),

    api.multiCall({
      abi: TOTAL_SUPPLY_ABI,
      calls: pairs,
    }),

    api.multiCall({
      abi: BALANCE_OF_ABI,
      calls: pairs.map((pair) => ({
        target: pair,
        params: [LIQUIDITY_VAULT],
      })),
    }),
  ])

  seededLiquidity.forEach(({ quoteToken }, i) => {
    const totalSupply = BigInt(totalSupplies[i])
    const lockedLpBalance = BigInt(lockedLpBalances[i])

    if (totalSupply === 0n || lockedLpBalance === 0n) return

    const token0 = token0s[i].toLowerCase()
    const token1 = token1s[i].toLowerCase()
    const quote = quoteToken.toLowerCase()

    const reserve0 = BigInt(
      reserves[i]._reserve0 ??
        reserves[i].reserve0 ??
        reserves[i][0],
    )

    const reserve1 = BigInt(
      reserves[i]._reserve1 ??
        reserves[i].reserve1 ??
        reserves[i][1],
    )

    let quoteReserve

    if (quote === token0) {
      quoteReserve = reserve0
    } else if (quote === token1) {
      quoteReserve = reserve1
    } else {
      return
    }

    const lockedQuote =
      (quoteReserve * lockedLpBalance) / totalSupply

    if (lockedQuote > 0n) {
      api.add(quoteToken, lockedQuote.toString())
    }
  })
}

module.exports = {
  methodology:
    'Counts external quote assets committed to DaWabLauncher markets on Robinhood Chain. Active bonding curves count only their accounted quoteReserve. After graduation, TVL counts only the quote-token share of AMM liquidity represented by LP tokens permanently held by the protocol liquidity vault. Relaunched-token inventory and protocol fees are excluded to avoid reflexive valuation and revenue being counted as TVL.',

  start: '2026-09-18',
  doublecounted: true,

  robinhood: {
    tvl,
  },
}
