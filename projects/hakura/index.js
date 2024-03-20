const sdk = require('@defillama/sdk');
const abi = require("../helper/abis/morpho.json");
const BigNumber = require("bignumber.js");
const { cEth, morphoCompoundMainnetLens, wEth } = require("./addresses");
const marketsUnderlyings = require("./marketsUnderlyings")
const { mergeExports } = require("../helper/utils")
const { yieldHelper, } = require("../helper/yieldHelper")

const getMetrics = async (balances, borrowed) => {
  const marketsCall = await sdk.api.abi.call({
    target: morphoCompoundMainnetLens,
    abi: abi.morphoLens.getAllMarkets,
    chain: "optimism"
  });
  const markets = marketsCall.output.filter(m => m.toLowerCase() !== cEth.toLowerCase()).map(market => market.toLowerCase())
  const underlyings = await marketsUnderlyings(markets)
  // add eth at the end of each list
  markets.push(cEth);
  underlyings.push(wEth);
  const balancesTotalBorrow = await sdk.api.abi.multiCall({
    calls: markets.map(market => ({
      params: [market]
    })),
    target: morphoCompoundMainnetLens,
    chain: "optimism",
    abi: abi.morphoLens.getTotalMarketBorrow
  })
  const toUnderlying = (marketAddress) => 'optimism:' + underlyings[markets.indexOf(marketAddress)] // multiCall keeps the order of the list
  if(borrowed) {
    balancesTotalBorrow.output.forEach((data) => {
      const totalBorrow = BigNumber(data.output.poolBorrowAmount).plus(data.output.p2pBorrowAmount).toFixed(0);
      sdk.util.sumSingleBalance(balances, toUnderlying(data.input.params[0]), totalBorrow)
    })
    return;
  }
  const balancesTotalSupply = await sdk.api.abi.multiCall({
    calls: markets.map(market => ({
      params: [market]
    })),
    target: morphoCompoundMainnetLens,
    chain: "optimism",
    abi: abi.morphoLens.getTotalMarketSupply
  })
  balancesTotalSupply.output.forEach((totalSupplyData, idx) => {
    const totalBorrowData = balancesTotalBorrow.output[idx];
    const totalBorrow = BigNumber(totalBorrowData.output.poolBorrowAmount).plus(totalBorrowData.output.p2pBorrowAmount);
    const totalSupply = BigNumber(totalSupplyData.output.poolSupplyAmount).plus(totalSupplyData.output.p2pSupplyAmount);
    const tvl = totalSupply.minus(totalBorrow).toFixed(0); // Through morpho, for a given market, this value can be negative.
    sdk.util.sumSingleBalance(balances, toUnderlying(totalSupplyData.input.params[0]), tvl)
  })
}

const fetchTvl = (borrowed) => {
  return async (timestamp)=> {
    const balances = {}
    await getMetrics(balances, borrowed)
    return balances;
  }
}

const contract = '0x2c7674027e7f1A9ba7e7d107Ad33EAb3ee7948c2'
const token = '0x17ffD1D55A5D9D73f6a337aA35109a63B405dE21'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount)',
}
const getTokenBalances = ({api, poolInfos, poolIds}) => {
  let balances = []
  for (const info of poolInfos)
    balances.push(info.amount)
  return balances
}

const hakura_helper = yieldHelper({
  project: 'hakura',
  chain: 'optimism',
  masterchef: contract,
  nativeToken: token,
  abis,
  poolFilter: i => i,
  getTokenBalances
})

module.exports = mergeExports([
  hakura_helper,
  {
    optimism: {
      tvl: fetchTvl(false),
      borrowed: fetchTvl(true),
    }
  }
])
