const sdk = require("@defillama/sdk")
const limWethAbi = require("./limWeth.json")
const vaultAbi = require("./vault.json")
const dataProviderAbi = require("./dataProvider.json")
const axios = require("axios")

const LIM_WETH_CONTRACT = '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce'
const BASE_WETH_CONTRACT = '0x4200000000000000000000000000000000000006'
const VAULT_CONTRACT = '0x1Cf3F6a9f8c6eEF1729E374B18F498E2d9fC6DCA'
const DATA_PROVIDER_CONTRACT = '0x87E697c3EBe41eD707E4AD52541f19292Be81177'

const LIQUIDITY_PROVIDED_QUERY = `
query {
  liquidityProvideds(first:1000 orderBy: blockTimestamp orderDirection: desc) {
    pool
    recipient
    liquidity
    tickLower
    tickUpper
    blockTimestamp
  }
}
`

const LIQUIDITY_WITHDRAWN_QUERY = `
query {
  liquidityWithdrawns(first:1000 orderBy: blockTimestamp orderDirection: desc) {
    pool
    recipient
    liquidity
    tickLower
    tickUpper
    blockTimestamp
  }
}
`

const LMT_SUBGRAPH_ENDPOINT_BASE = 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-base/version/latest'

async function base_tvl(api) {
  const tokenBalance = BigInt((await sdk.api.abi.call({
    target: LIM_WETH_CONTRACT,
    abi: limWethAbi.tokenBalance,
    chain: 'base'
  })).output)
  api.add(BASE_WETH_CONTRACT, tokenBalance)

  const vault = BigInt((await sdk.api.abi.call({
    target: VAULT_CONTRACT,
    abi: vaultAbi.totalAssets,
    chain: 'base'
  })).output)

  api.add(VAULT_CONTRACT, vault)

  const providedData = (await axios.post(LMT_SUBGRAPH_ENDPOINT_BASE, {
    query: LIQUIDITY_PROVIDED_QUERY
  })).data.data.liquidityProvideds

  const withdrawnData = (await axios.post(LMT_SUBGRAPH_ENDPOINT_BASE, {
    query: LIQUIDITY_WITHDRAWN_QUERY
  })).data.data.liquidityWithdrawns

  let pools = new Set()
  providedData.forEach((entry) => {
    const pool = entry.pool
    if (!pools.has(pool)) {
      pools.add(pool)
    }
  })
  const uniquePools = Array.from(pools)

  const uniqueTokens = new Map()

  await Promise.all(
    Array.from(pools).map(async (pool) => {
      const token = (await sdk.api.abi.call({
        target: DATA_PROVIDER_CONTRACT,
        params: pool,
        abi: dataProviderAbi.getPoolKeys,
        chain: 'base'
      })).output

      if (token) {
        if (!uniqueTokens.has(pool)) {
          uniqueTokens.set(pool, [
            token[0],
            token[1],
            token[2]
          ])
        }
        return { poolAdress: (token[0], token[1], token[2]) }
      } else return null
    })
  )

  const slot0s = []
  const slot0ByPoolAddress = {}

  uniquePools?.forEach((pool, index) => {
    const slot0 = slot0s[index]
    if (slot0 && uniqueTokens.get(pool)) {
      const poolAddress = pool
      if (!slot0ByPoolAddress[poolAddress]) {
        slot0ByPoolAddress[poolAddress] = slot0.result
      }
    }
  })


  const mulShift = (val, mulBy) => {
    return val * mulBy >> 128n
  }

  const getSqrtRatioAtTick = (tick) => {
    const MIN_TICK = -887272
    const MAX_TICK = -MIN_TICK
    const MaxUint256 = 2n ** 256n - 1n
    // invariant(tick >= MIN_TICK && tick <= MAX_TICK && Number.isInteger(tick), 'TICK')
    const absTick = tick < 0 ? tick * -1 : tick

    let ratio =
      (absTick & 0x1) != 0
        ? 0xfffcb933bd6fad37aa2d162d1a594001n
        : 0x100000000000000000000000000000000n
    if ((absTick & 0x2) != 0) ratio = mulShift(ratio, 0xfff97272373d413259a46990580e213an)
    if ((absTick & 0x4) != 0) ratio = mulShift(ratio, 0xfff2e50f5f656932ef12357cf3c7fdccn)
    if ((absTick & 0x8) != 0) ratio = mulShift(ratio, 0xffe5caca7e10e4e61c3624eaa0941cd0n)
    if ((absTick & 0x10) != 0) ratio = mulShift(ratio, 0xffcb9843d60f6159c9db58835c926644n)
    if ((absTick & 0x20) != 0) ratio = mulShift(ratio, 0xff973b41fa98c081472e6896dfb254c0n)
    if ((absTick & 0x40) != 0) ratio = mulShift(ratio, 0xff2ea16466c96a3843ec78b326b52861n)
    if ((absTick & 0x80) != 0) ratio = mulShift(ratio, 0xfe5dee046a99a2a811c461f1969c3053n)
    if ((absTick & 0x100) != 0) ratio = mulShift(ratio, 0xfcbe86c7900a88aedcffc83b479aa3a4n)
    if ((absTick & 0x200) != 0) ratio = mulShift(ratio, 0xf987a7253ac413176f2b074cf7815e54n)
    if ((absTick & 0x400) != 0) ratio = mulShift(ratio, 0xf3392b0822b70005940c7a398e4b70f3n)
    if ((absTick & 0x800) != 0) ratio = mulShift(ratio, 0xe7159475a2c29b7443b29c7fa6e889d9n)
    if ((absTick & 0x1000) != 0) ratio = mulShift(ratio, 0xd097f3bdfd2022b8845ad8f792aa5825n)
    if ((absTick & 0x2000) != 0) ratio = mulShift(ratio, 0xa9f746462d870fdf8a65dc1f90e061e5n)
    if ((absTick & 0x4000) != 0) ratio = mulShift(ratio, 0x70d869a156d2a1b890bb3df62baf32f7n)
    if ((absTick & 0x8000) != 0) ratio = mulShift(ratio, 0x31be135f97d08fd981231505542fcfa6n)
    if ((absTick & 0x10000) != 0) ratio = mulShift(ratio, 0x9aa508b5b7a84e1c677de54f3e99bc9n)
    if ((absTick & 0x20000) != 0) ratio = mulShift(ratio, 0x5d6af8dedb81196699c329225ee604n)
    if ((absTick & 0x40000) != 0) ratio = mulShift(ratio, 0x2216e584f5fa1ea926041bedfe98n)
    if ((absTick & 0x80000) != 0) ratio = mulShift(ratio, 0x48a170391f7dc42444e8fa2n)

    if (tick > 0) ratio = MaxUint256 / ratio
    const Q32 = 2n ** 32n
    const ZERO = 0n
    const ONE = 1n
    // back to Q96
    return ratio % Q32 > ZERO
      ? ratio / Q32 + ONE
      : ratio / Q32
  }

  const mulDivRoundingUp = (a, b, denominator) => {
    const ONE = 1n
    const product = a * b
    let result = product / denominator
    if (product % denominator !== ZERO) result += ONE
    return result
  }

  const getAmount0Delta = (sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp) => {
    const ONE = 1n
    if (sqrtRatioAX96 > sqrtRatioBX96) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    const numerator1 = liquidity << 96n
    const numerator2 = sqrtRatioBX96 - sqrtRatioAX96

    return roundUp
      ? mulDivRoundingUp(mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96), ONE, sqrtRatioAX96)
      : numerator1 * numerator2 / sqrtRatioBX96 / sqrtRatioAX96
  }

  const getAmount1Delta = (sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp) => {
    const Q96 = 2n ** 96n
    if (sqrtRatioAX96 > sqrtRatioBX96) {
      ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
    }

    return roundUp
      ? mulDivRoundingUp(liquidity, sqrtRatioBX96 - sqrtRatioAX96, Q96)
      : liquidity * (sqrtRatioBX96 - sqrtRatioAX96) / Q96
  }


  const processLiqEntry = (entry) => {
    const pool = entry.pool
    let curTick = slot0ByPoolAddress[pool]?.[0].tick
    if (!curTick) curTick = slot0ByPoolAddress?.[pool]?.tick


    let amount0
    let amount1
    if (curTick < entry.tickLower) {
      amount0 = getAmount0Delta(
        getSqrtRatioAtTick(entry.tickLower),
        getSqrtRatioAtTick(entry.tickUpper),
        BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = '0'
    } else if (curTick > entry.tickUpper) {
      amount0 = getAmount0Delta(
        getSqrtRatioAtTick(curTick),
        getSqrtRatioAtTick(entry.tickUpper),
        BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = getAmount1Delta(
        getSqrtRatioAtTick(entry.tickLower),
        getSqrtRatioAtTick(curTick),
        BigInt(entry.liquidity.toString()),
        false
      ).toString()
    } else {
      amount1 = getAmount1Delta(
        getSqrtRatioAtTick(entry.tickLower),
        getSqrtRatioAtTick(entry.tickUpper),
        BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount0 = '0'
    }

    const tokens = uniqueTokens.get(pool)

    return {
      pool,
      amount0,
      amount1,
      token0: tokens[0],
      token1: tokens[1]
    }
  }

  const ProvidedDataProcessed = providedData?.map(processLiqEntry)
  const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)

  const sumProvidedData = ProvidedDataProcessed.reduce((acc, cur) => {
    if (!acc[cur.pool]) {
      acc[cur.pool] = { 
        amount0: BigInt(cur.amount0), 
        amount1: BigInt(cur.amount1),
        token0: cur.token0,
        token1: cur.token1 
      }
    } else {
      acc[cur.pool].amount0 += BigInt(cur.amount0)
      acc[cur.pool].amount1 += BigInt(cur.amount1)
    }
    return acc
  }, {})

  const sumWithdrawnData = WithdrawDataProcessed.reduce((acc, cur) => {
    if (!acc[cur.pool]) {
      acc[cur.pool] = { 
        amount0: BigInt(cur.amount0), 
        amount1: BigInt(cur.amount1),
        token0: cur.token0,
        token1: cur.token1
      }
    } else {
      acc[cur.pool].amount0 += BigInt(cur.amount0)
      acc[cur.pool].amount1 += BigInt(cur.amount1)
    }
    return acc
  }, {})

  const diffData = {}

  for (const pool in sumProvidedData) {
    if (sumWithdrawnData[pool]) {
      diffData[pool] = { 
        amount0: sumProvidedData[pool].amount0 - sumWithdrawnData[pool].amount0,
        amount1: sumProvidedData[pool].amount1 - sumWithdrawnData[pool].amount1,
        token0: sumProvidedData[pool].token0,
        token1: sumProvidedData[pool].token1
      }
    } else {
      diffData[pool] = { 
        amount0: sumProvidedData[pool].amount0,
        amount1: sumProvidedData[pool].amount1,
        token0: sumProvidedData[pool].token0,
        token1: sumProvidedData[pool].token1
      }
    }
  }

  Object.values(diffData).forEach((entry) => {
    api.add(entry.token0, entry.amount0.toString())
    api.add(entry.token1, entry.amount1.toString())
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'counts the number of LMT tokens.',
  start: 1712389967,
  base: {
    tvl:base_tvl,
  }
} 
