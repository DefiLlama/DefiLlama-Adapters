const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/morpho.json");
const erc20 = require("../helper/abis/erc20.json");
const {morphoAaveV3} = require("./addresses");
const BigNumber = require("bignumber.js");
const fetchMarketsData = require("./markets");

const getMetrics = async (balances, block, borrowed) => {
  const marketsCall = await sdk.api.abi.call({
    target: morphoAaveV3,
    abi: abi.morphoAaveV3.marketsCreated,
    block,
    chain: "ethereum"
  });
  const markets = marketsCall.output;
  const marketsData = await fetchMarketsData(markets, block);
  const balancesTotalBorrowOnPool = await sdk.api.abi.multiCall({
    calls: marketsData.map(({debtToken}) => ({
      target: debtToken,
      params: [morphoAaveV3]
    })),
    block,
    chain: "ethereum",
    abi: erc20.balanceOf
  });
  const totalBorrows = marketsData.map(({scaledP2PBorrow, p2pBorrowIndex}, i) => {
    const totalBorrowOnPool = balancesTotalBorrowOnPool.output[i].output;
    const totalBorrowP2P = BigNumber(scaledP2PBorrow).times(p2pBorrowIndex).div(10**27).toFixed(0);
    return BigNumber(totalBorrowOnPool).plus(totalBorrowP2P).toFixed(0);
  });
  if (borrowed) {
    marketsData.forEach(({underlying}, idx) => {
      sdk.util.sumSingleBalance(balances, underlying, totalBorrows[idx])
    });
    return;
  }

  const balancesTotalSupplyOnPool = await sdk.api.abi.multiCall({
    calls: marketsData.map(({aToken}) => ({
      target: aToken,
      params: [morphoAaveV3]
    })),
    block,
    chain: "ethereum",
    abi: erc20.balanceOf
  });
  marketsData.forEach(({underlying, scaledP2PSupply, p2pSupplyIndex}, idx) => {
    const totalBorrow = totalBorrows[idx];
    const totalSupplyOnPool = balancesTotalSupplyOnPool.output[idx].output;
    const totalSupplyP2P = BigNumber(scaledP2PSupply).times(p2pSupplyIndex).div(10**27).toFixed(0);
    const totalSupply = BigNumber(totalSupplyOnPool).plus(totalSupplyP2P);
    const tvl = totalSupply.minus(totalBorrow).toFixed(0); // Through morpho, for a given market, this value can be negative.
    sdk.util.sumSingleBalance(balances, underlying, tvl);
  });
};

const ethereum = (borrowed) => {
  return async (timestamp, block) => {
    const balances = {};
    await getMetrics(balances, block, borrowed);
    return balances;
  };
};

module.exports = {
  timetravel: true,
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  ethereum: {
    tvl: ethereum(false),
    borrowed: ethereum(true)
  }
};
// node test.js projects/morpho-aave/index.js