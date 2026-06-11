const abi = require("../helper/abis/morpho.json");
const BigNumber = require("bignumber.js");
const { cEth, morphoCompoundMainnetLens, wEth } = require("./addresses");
const marketsUnderlyings = require("./marketsUnderlyings")


const getMetrics = async (api, borrowed) => {
  const allMarkets = await api.call({
    target: morphoCompoundMainnetLens,
    abi: abi.morphoLens.getAllMarkets,
  });
  const markets = allMarkets.filter(m => m.toLowerCase() !== cEth).map(market => market.toLowerCase())
  const underlyings = await marketsUnderlyings(api, markets)
  // add eth at the end of each list
  markets.push(cEth);
  underlyings.push(wEth);
  const balancesTotalBorrow = await api.multiCall({
    calls: markets.map(market => ({ params: [market] })),
    target: morphoCompoundMainnetLens,
    abi: abi.morphoLens.getTotalMarketBorrow
  })
  if(borrowed) {
    balancesTotalBorrow.forEach((data, idx) => {
      const totalBorrow = BigNumber(data.poolBorrowAmount).plus(data.p2pBorrowAmount).toFixed(0);
      api.add(underlyings[idx], totalBorrow)
    })
    return;
  }
  const balancesTotalSupply = await api.multiCall({
    calls: markets.map(market => ({ params: [market] })),
    target: morphoCompoundMainnetLens,
    abi: abi.morphoLens.getTotalMarketSupply
  })
  balancesTotalSupply.forEach((totalSupplyData, idx) => {
    const totalBorrowData = balancesTotalBorrow[idx];
    const totalBorrow = BigNumber(totalBorrowData.poolBorrowAmount).plus(totalBorrowData.p2pBorrowAmount);
    const totalSupply = BigNumber(totalSupplyData.poolSupplyAmount).plus(totalSupplyData.p2pSupplyAmount);
    const tvl = totalSupply.minus(totalBorrow).toFixed(0); // Through morpho, for a given market, this value can be negative.
    api.add(underlyings[idx], tvl)
  })
}

const ethereum = (borrowed) => {
  return async (api)=> {
    await getMetrics(api, borrowed)
    return api.getBalances();
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
