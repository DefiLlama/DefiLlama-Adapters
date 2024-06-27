const { blockQuery } = require("../helper/http");
const wildCreditABI = require('../wildcredit/abi.json');
const { getLogs } = require('../helper/cache/getLogs')
const DopexV2ClammFeeStrategy = '0xC808AcB06077174333b31Ae123C33c6559730035'

const query = (skip = 0, limit = 1000) => `query ($block: Int) {
  strikes(
    block: {number: $block}
    first: ${limit}
    skip: ${skip}
    where: {totalLiquidity_gt: 100}
    orderBy: totalLiquidity
    orderDirection: desc
  ) {
    pool
    token0 { id }
    token1 { id }
    tickLower
    tickUpper
    totalLiquidity
  }
}`

async function tvl(api) {
  const allData = []
  let hasMore = true
  let skip = 0
  let limit = 1000
  do {
    const { strikes } = await blockQuery("http://api.0xgraph.xyz/subgraphs/name/dopex-v2-clamm-public", query(skip, limit), { api })
    skip += limit
    allData.push(...strikes)
    hasMore = strikes.length === limit
  } while (hasMore)

  let pools = allData.map(strike => strike.pool.toLowerCase())
  pools = [...new Set(pools)]
  const sqrtPrices = await api.multiCall({ calls: pools, abi: wildCreditABI.slot0, })
  const sqrtPricesMap = sqrtPrices.reduce((acc, item, i) => {
    return { ...acc, [pools[i]]: item, }
  }, {});
  allData.map(addV3PositionBalances)

  // const logs = await getLogs({
  //   api,
  //   target: DopexV2ClammFeeStrategy,
  //   eventAbi: 'event OptionMarketRegistered (address optionMarket)',
  //   onlyArgs: true,
  //   fromBlock: 149751550,
  // })
  // const markets = logs.map(log => log.optionMarket)
  // const callAssets = await api.multiCall({ abi: 'address:callAsset', calls: markets })
  // const putAssets = await api.multiCall({ abi: 'address:putAsset', calls: markets })
  // const ownerTokens = markets.map((v, i) => [[callAssets[i], putAssets[i]], v])
  // return api.sumTokens({ ownerTokens})

  return api.getBalances()


  function addV3PositionBalances(strike) {
    const tickToPrice = (tick) => 1.0001 ** tick

    const token0 = strike.token0.id
    const token1 = strike.token1.id
    const liquidity = strike.totalLiquidity
    const bottomTick = +strike.tickLower
    const topTick = +strike.tickUpper
    const tick = +sqrtPricesMap[strike.pool.toLowerCase()].tick
    const sa = tickToPrice(bottomTick / 2)
    const sb = tickToPrice(topTick / 2)

    let amount0 = 0
    let amount1 = 0

    if (tick < bottomTick) {
      amount0 = liquidity * (sb - sa) / (sa * sb)
    } else if (tick < topTick) {
      const price = tickToPrice(tick)
      const sp = price ** 0.5

      amount0 = liquidity * (sb - sp) / (sp * sb)
      amount1 = liquidity * (sp - sa)
    } else {
      amount1 = liquidity * (sb - sa)
    }

    api.add(token0, amount0)
    api.add(token1, amount1)
  }
}
module.exports = {
  doublecounted: true,  // tokens are stored in UNI-V3 pools
  arbitrum: { tvl, },
};
