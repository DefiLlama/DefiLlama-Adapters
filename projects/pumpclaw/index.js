const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const ethers = require('ethers')

const FACTORY = '0xe5bCa0eDe9208f7Ee7FCAFa0415Ca3DC03e16a90'
const STATE_VIEW = '0xa3c0c9b65bad0b08107aa264b0f3db444b867a71' // Uniswap V4 StateView on Base
const LP_FEE = 10000
const TICK_SPACING = 200
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

const eventAbi = 'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint256 positionId, uint256 totalSupply, uint256 initialFdv, int24 tickLower, int24 tickUpper)'

const Q96 = 1n << 96n
const Q128 = 1n << 128n

/**
 * Port of Uniswap V3/V4 TickMath.getSqrtRatioAtTick
 * Returns sqrtPriceX96 (Q96 fixed-point) for a given tick
 */
function getSqrtRatioAtTick(tick) {
  const absTick = BigInt(Math.abs(tick))

  let ratio
  if (absTick & 0x1n) ratio = 0xfffcb933bd6fad37aa2d162d1a594001n
  else ratio = Q128

  if (absTick & 0x2n) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n
  if (absTick & 0x4n) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n
  if (absTick & 0x8n) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n
  if (absTick & 0x10n) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n
  if (absTick & 0x20n) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n
  if (absTick & 0x40n) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n
  if (absTick & 0x80n) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n
  if (absTick & 0x100n) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n
  if (absTick & 0x200n) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n
  if (absTick & 0x400n) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n
  if (absTick & 0x800n) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n
  if (absTick & 0x1000n) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n
  if (absTick & 0x2000n) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n
  if (absTick & 0x4000n) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n
  if (absTick & 0x8000n) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n
  if (absTick & 0x10000n) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n
  if (absTick & 0x20000n) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n
  if (absTick & 0x40000n) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n
  if (absTick & 0x80000n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n

  if (tick > 0) ratio = ((1n << 256n) - 1n) / ratio

  // Convert Q128 → Q96
  return (ratio >> 32n) + (ratio % (1n << 32n) > 0n ? 1n : 0n)
}

/**
 * Calculate token0 (ETH) amount for given sqrt price range and liquidity
 * Port of Uniswap SqrtPriceMath.getAmount0Delta
 */
function getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (sqrtRatioAX96 > sqrtRatioBX96) {
    ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
  }
  const numerator1 = liquidity * Q96
  const numerator2 = sqrtRatioBX96 - sqrtRatioAX96
  return (numerator1 * numerator2 / sqrtRatioBX96) / sqrtRatioAX96
}

/**
 * Compute position liquidity from single-sided token1 (Token) deposit
 * Used at pool creation: 100% tokens deposited at tickUpper, 0 ETH
 */
function getLiquidityForAmount1(sqrtRatioLowerX96, sqrtRatioUpperX96, amount1) {
  return amount1 * Q96 / (sqrtRatioUpperX96 - sqrtRatioLowerX96)
}

/**
 * PumpClaw TVL: sum of ETH locked in all Uniswap V4 pools
 *
 * Each pool starts with 100% tokens at tickUpper. As users buy tokens (sell ETH),
 * the tick moves down and ETH accumulates. Position liquidity is constant
 * (single position per pool, LP locked forever in LPLocker).
 *
 * For each pool we:
 * 1. Compute position liquidity from initial totalSupply deposit
 * 2. Query current price (sqrtPriceX96) from StateView
 * 3. Calculate ETH portion using Uniswap V4 concentrated liquidity math
 */
async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: 25973600,
    eventAbi,
  })

  if (!logs.length) return {}

  // Compute poolId = keccak256(abi.encode(PoolKey)) for each token
  const coder = ethers.AbiCoder.defaultAbiCoder()
  const poolIds = logs.map(log => {
    const encoded = coder.encode(
      ['address', 'address', 'uint24', 'int24', 'address'],
      [ZERO_ADDR, log.token, LP_FEE, TICK_SPACING, ZERO_ADDR]
    )
    return ethers.keccak256(encoded)
  })

  // Batch query slot0 via StateView (PoolManager uses extsload, not view functions)
  const slot0s = await api.multiCall({
    abi: 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
    target: STATE_VIEW,
    calls: poolIds,
  })

  let totalEthWei = 0n

  for (let i = 0; i < logs.length; i++) {
    const tickLower = Number(logs[i].tickLower)
    const tickUpper = Number(logs[i].tickUpper)
    const totalSupply = BigInt(logs[i].totalSupply)
    const sqrtPriceX96Raw = slot0s[i]?.sqrtPriceX96 ?? slot0s[i]?.[0]
    const tickRaw = slot0s[i]?.tick ?? slot0s[i]?.[1]

    // Skip pools with no data
    if (!sqrtPriceX96Raw || sqrtPriceX96Raw === '0' || sqrtPriceX96Raw === 0n) continue

    const currentTick = Number(tickRaw)

    // Skip pools where no trades occurred (tick still at upper = 100% tokens, 0 ETH)
    if (currentTick >= tickUpper) continue

    const sqrtLowerX96 = getSqrtRatioAtTick(tickLower)
    const sqrtUpperX96 = getSqrtRatioAtTick(tickUpper)

    // Position liquidity from initial single-sided token deposit
    // L = totalSupply * Q96 / (sqrtUpper - sqrtLower)
    const liquidity = getLiquidityForAmount1(sqrtLowerX96, sqrtUpperX96, totalSupply)

    let ethAmount
    if (currentTick < tickLower) {
      // Fully converted to ETH (tick moved below position range)
      ethAmount = getAmount0ForLiquidity(sqrtLowerX96, sqrtUpperX96, liquidity)
    } else {
      // Partially in range — ETH accumulated proportional to price movement
      const sqrtCurrentX96 = BigInt(sqrtPriceX96Raw)
      ethAmount = getAmount0ForLiquidity(sqrtCurrentX96, sqrtUpperX96, liquidity)
    }

    totalEthWei += ethAmount
  }

  // Report as WETH (always priced by DefiLlama)
  api.add(ADDRESSES.base.WETH, totalEthWei.toString())
}

module.exports = {
  methodology: 'Calculates ETH locked in Uniswap V4 concentrated liquidity pools created by PumpClaw. Each pool starts with 100% tokens and accumulates ETH through trading. ETH amounts are computed off-chain using on-chain price data and Uniswap V4 math. All LP positions are permanently locked.',
  start: 1769932905,
  base: { tvl },
}
