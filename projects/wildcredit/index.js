const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");

BigNumber.config({ EXPONENTIAL_AT: 100 })

const PAIR_FACTORY = "0x0fC7e80090bbc1740595b1fcCd33E0e82547212F";
const UNI_V3_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
const UNI_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const START_BLOCK = 13847198

const calculateTokenTotal = async (balances, block, pairs, abi) => {
  const pairsTokenBalances = (await sdk.api.abi.multiCall({
    calls: pairs.map(pair => ({
      target: pair.pair,
      params: pair.token
    })),
    abi,
    block
  })).output.map(result => result.output);

  for (let index = 0; index < pairs.length; index++) {
    sdk.util.sumSingleBalance(
      balances,
      pairs[index].token,
      pairsTokenBalances[index]
    );
  }
}

const getPairs = async (toBlock) => {
  const logs = (await sdk.api.util.getLogs({
    target: PAIR_FACTORY,
    topic: 'PairCreated(address,address,address)',
    keys: [],
    fromBlock: START_BLOCK,
    toBlock,
  })).output

  return logs.map(log => {
    return {
      pair: `0x${log.topics[1].substr(-40).toLowerCase()}`,
      tokenA: `0x${log.topics[2].substr(-40).toLowerCase()}`,
      tokenB: `0x${log.topics[3].substr(-40).toLowerCase()}`
    }
  })
}

const getUniV3PositionBalances = async (positionId, ethBlock) => {

  const tickToPrice = (tick) => new BigNumber(1.0001).pow(tick)
 
  const { output: position } = await sdk.api.abi.call({
    block: ethBlock,
    abi: abi.positions,
    target: UNI_V3_POSITION_MANAGER,
    params: [positionId]
  })

  const token0 = position.token0
  const token1 = position.token1
  const fee = position.fee
  const liquidity = position.liquidity
  const bottomTick = position.tickLower
  const topTick = position.tickUpper

  const { output: pool } = await sdk.api.abi.call({
    block: ethBlock,
    abi: abi.getPool,
    target: UNI_V3_FACTORY,
    params: [token0, token1, fee]
  })

  const { output: slot0 } = await sdk.api.abi.call({
    block: ethBlock,
    abi: abi.slot0,
    target: pool
  })

  const tick = slot0.tick

  let amount0 = 0
  let amount1 = 0

  if (Number(tick) < Number(bottomTick)) {
    const sa = tickToPrice(new BigNumber(bottomTick).div(2).integerValue(BigNumber.ROUND_DOWN))
    const sb = tickToPrice(new BigNumber(topTick).div(2).integerValue(BigNumber.ROUND_DOWN))
  
    amount0 = new BigNumber(liquidity).times(new BigNumber(sb.minus(sa)).div(sa.times(sb))).integerValue(BigNumber.ROUND_DOWN)
  } else if (Number(tick) < Number(topTick)) {
    const sa = tickToPrice(Math.floor(bottomTick / 2))
    const sb = tickToPrice(Math.floor(topTick / 2))
    const price = tickToPrice(tick)
    const sp = price ** 0.5
  
    amount0 = new BigNumber(liquidity * (sb - sp) / (sp * sb)).integerValue(BigNumber.ROUND_DOWN)
    amount1 = new BigNumber(liquidity * (sp - sa)).integerValue(BigNumber.ROUND_DOWN)
  } else {
    const sa = tickToPrice(new BigNumber(bottomTick).div(2)).integerValue(BigNumber.ROUND_DOWN)
    const sb = tickToPrice(new BigNumber(topTick).div(2)).integerValue(BigNumber.ROUND_DOWN)

    amount1 = new BigNumber(liquidity).times(new BigNumber(sb.minus(sa))).integerValue(BigNumber.ROUND_DOWN)
  }

  return {
    [token0]: amount0.toString(),
    [token1]: amount1.toString()
  }
}

const calculateUniV3LPTotal = async (balances, ethBlock, pairs) => {
  await Promise.all(pairs.map(async pair => {
    try {
      const { output: pairUniPositionsCount } = await sdk.api.abi.call({
        block: ethBlock,
        abi: abi.balanceOf,
        target: UNI_V3_POSITION_MANAGER,
        params: [pair]
      })

      const positionIds = (await sdk.api.abi.multiCall({
        block: ethBlock,
        calls: Array(Number(pairUniPositionsCount)).fill(0).map((_, index) => ({
          target: UNI_V3_POSITION_MANAGER,
          params: [pair, index]
        })),
        abi: abi.tokenOfOwnerByIndex
      })).output.map(positionIdCall => positionIdCall.output)

      await Promise.all(positionIds.map(async positionId => {
        const positionBalances = await getUniV3PositionBalances(positionId, ethBlock)
        Object.keys(positionBalances).forEach(key => {
          sdk.util.sumSingleBalance(balances, key, positionBalances[key])
        })
      }))

    } catch (e) {
      console.log(`Failed to get uniV3LP data for pair: ${pair.pair}`, e)
    }
  }))
}

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const pairs = await getPairs(ethBlock)

  await calculateTokenTotal(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenA }) => ({ pair, token: tokenA })),
    abi.totalSupplyAmount
  )

  await calculateTokenTotal(
    balances, 
    ethBlock, 
    pairs.map(({ pair, tokenB }) => ({ pair, token: tokenB })),
    abi.totalSupplyAmount
  )

  await calculateUniV3LPTotal(
    balances,
    ethBlock,
    pairs.map(({ pair }) => pair)
  )

  return balances;
};

const borrowed = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const pairs = await getPairs(ethBlock)

  await calculateTokenTotal(
    balances,
    ethBlock,
    pairs.map(({ pair, tokenA }) => ({ pair, token: tokenA })),
    abi.totalDebtAmount
  )

  await calculateTokenTotal(
    balances,
    ethBlock,
    pairs.map(({ pair, tokenB }) => ({ pair, token: tokenB })),
    abi.totalDebtAmount
  )

  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    borrowed
  },
};
