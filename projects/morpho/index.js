const sdk = require('@defillama/sdk');
const abi = require("../helper/abis/morpho.json");
const BigNumber = require("bignumber.js");
const { cEth, morphoCompoundMainnetLens, wEth } = require("./addresses");
const marketsUnderlyings = require("./marketsUnderlyings")


const getMetrics = async (balances, block, borrowed) => {
  const marketsCall = await sdk.api.abi.call({
    target: morphoCompoundMainnetLens,
    abi: abi.morphoLens.getAllMarkets,
    block,
    chain: "ethereum"
  });
  const markets = marketsCall.output.filter(m => m.toLowerCase() !== cEth).map(market => market.toLowerCase())
  const underlyings = await marketsUnderlyings(markets, block)
  // add eth at the end of each list
  markets.push(cEth);
  underlyings.push(wEth);
  const balancesTotalBorrow = await sdk.api.abi.multiCall({
    calls: markets.map(market => ({
      params: [market]
    })),
    target: morphoCompoundMainnetLens,
    block,
    chain: "ethereum",
    abi: abi.morphoLens.getTotalMarketBorrow
  })
  const toUnderlying = (marketAddress) => underlyings[markets.indexOf(marketAddress)] // multiCall keeps the order of the list
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
    block,
    chain: "ethereum",
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

const ethereum = (borrowed) => {
  return async (timestamp, block)=> {
    const balances = {}
    await getMetrics(balances, block, borrowed)
    return balances;
  }
}

module.exports = {
    doublecounted: true,
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  ethereum: {
    tvl: ethereum(false),
    borrowed: ethereum(true),
  }
};
// node test.js projects/morpho-compound/index.js
