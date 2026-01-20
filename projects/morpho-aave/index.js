const abi = require("../helper/abis/morpho.json");
const BigNumber = require("bignumber.js");
const { morphoAaveV2MainnetLens } = require("./addresses");


const getMetrics = async (api, borrowed) => {
  const markets = await api.call({ target: morphoAaveV2MainnetLens, abi: abi.morphoLens.getAllMarkets, });
  const underlyings = await api.multiCall({ calls: markets, abi: "address:UNDERLYING_ASSET_ADDRESS" })

  const balancesTotalBorrow = await api.multiCall({
    calls: markets,
    target: morphoAaveV2MainnetLens,
    abi: abi.morphoLens.getTotalMarketBorrow
  });
  const toUnderlying = (marketAddress) => underlyings[markets.indexOf(marketAddress)]; // multiCall keeps the order of the list

  if (borrowed) {
    balancesTotalBorrow.forEach((data, idx) => {
      const totalBorrow = BigNumber(data.poolBorrowAmount).plus(data.p2pBorrowAmount).toFixed(0);
      const token = underlyings[idx]
      api.add(token, totalBorrow);
    });
    return;
  }

  const balancesTotalSupply = await api.multiCall({
    calls: markets,
    target: morphoAaveV2MainnetLens,
    abi: abi.morphoLens.getTotalMarketSupply
  });

  balancesTotalSupply.forEach((totalSupplyData, idx) => {
    const token = underlyings[idx]
    const totalBorrowData = balancesTotalBorrow[idx];
    const totalBorrow = BigNumber(totalBorrowData.poolBorrowAmount).plus(totalBorrowData.p2pBorrowAmount);
    const totalSupply = BigNumber(totalSupplyData.poolSupplyAmount).plus(totalSupplyData.p2pSupplyAmount);
    const tvl = totalSupply.minus(totalBorrow).toFixed(0); // Through morpho, for a given market, this value can be negative.
    api.add(token, tvl);
  });
};

const ethereum = (borrowed) => {
  return async (api) => {
    await getMetrics(api, borrowed);
  };
};

module.exports = {
  doublecounted: true,
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  ethereum: {
    tvl: ethereum(false),
    borrowed: ethereum(true)
  }
};
// node test.js projects/morpho-aave/index.js
