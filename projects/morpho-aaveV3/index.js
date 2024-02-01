const abi = require("../helper/abis/morpho.json");
const erc20 = require("../helper/abis/erc20.json");
const {morphoAaveV3} = require("./addresses");
const BigNumber = require("bignumber.js");
const fetchMarketsData = require("./markets");

const getMetrics = async (api, borrowed) => {
  const markets = await api.call({    target: morphoAaveV3,    abi: abi.morphoAaveV3.marketsCreated,  });
  const marketsData = await fetchMarketsData(markets, api);
  const balancesTotalBorrowOnPool = await api.multiCall({
    calls: marketsData.map(({debtToken}) => ({
      target: debtToken,
      params: [morphoAaveV3]
    })),
    abi: erc20.balanceOf
  });
  const totalBorrows = marketsData.map(({scaledP2PBorrow, p2pBorrowIndex}, i) => {
    const totalBorrowOnPool = balancesTotalBorrowOnPool[i];
    const totalBorrowP2P = BigNumber(scaledP2PBorrow).times(p2pBorrowIndex).div(10**27).toFixed(0);
    return BigNumber(totalBorrowOnPool).plus(totalBorrowP2P).toFixed(0);
  });
  if (borrowed) {
    marketsData.forEach(({underlying}, idx) => {
      api.add(underlying, totalBorrows[idx])
    });
    return;
  }

  const balancesTotalSupplyOnPool = await api.multiCall({
    calls: marketsData.map(({aToken}) => ({
      target: aToken,
      params: [morphoAaveV3]
    })),
    abi: erc20.balanceOf
  });
  marketsData.forEach(({underlying, scaledP2PSupply, p2pSupplyIndex}, idx) => {
    const totalBorrow = totalBorrows[idx];
    const totalSupplyOnPool = balancesTotalSupplyOnPool[idx];
    const totalSupplyP2P = BigNumber(scaledP2PSupply).times(p2pSupplyIndex).div(10**27).toFixed(0);
    const totalSupply = BigNumber(totalSupplyOnPool).plus(totalSupplyP2P);
    const tvl = totalSupply.minus(totalBorrow).toFixed(0); // Through morpho, for a given market, this value can be negative.
    api.add(underlying, tvl)
  });
};

const ethereum = (borrowed) => {
  return async (timestamp, block, _, { api }) => {
    return getMetrics(api, borrowed);
  };
};

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  doublecounted: true,
  ethereum: {
    tvl: ethereum(false),
    borrowed: ethereum(true)
  }
};
// node test.js projects/morpho-aave/index.js
