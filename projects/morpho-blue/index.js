const erc20 = require("../helper/abis/erc20.json");
const abi = require("../helper/abis/morpho.json");
const { morphoBlue, whitelistedIds } = require("./addresses");
const BigNumber = require("bignumber.js");
const fetchMarketsData = require("./markets");

// Function to get balances of collateral tokens
const getCollateralTokensBalanceOf = async (api, collateralTokens) => {
  const balances = await api.multiCall({
    calls: collateralTokens.map((token) => ({
      target: token,
      params: [morphoBlue],
    })),
    abi: erc20.balanceOf,
  });
  return balances.reduce((acc, balance, index) => {
    acc[collateralTokens[index]] = new BigNumber(balance);
    return acc;
  }, {});
};

// Function to process market data and compute metrics
const processMarketData = (market) => {
  return {
    loanToken: market.loanToken,
    collateralToken: market.collateralToken,
    totalSupply: new BigNumber(market.totalSupplyAssets),
    totalBorrow: new BigNumber(market.totalBorrowAssets),
  };
};

// Function to compute TVL and borrowed metrics
const computeMetrics = (
  aggregatedMetrics,
  loanToken,
  collateralAmounts,
  borrowed
) => {
  const { totalSupply, totalBorrow } = aggregatedMetrics[loanToken];
  let tvl = totalSupply.minus(totalBorrow);

  if (collateralAmounts[loanToken]) {
    const collateralBalance = collateralAmounts[loanToken];
    const adjustedCollateral = collateralBalance
      .minus(totalSupply)
      .plus(totalBorrow)
      .toFixed(0);
    tvl = tvl.plus(adjustedCollateral);
  }

  return borrowed ? totalBorrow.toFixed(0) : tvl.toFixed(0);
};

// Function to add collateral token metrics
const addCollateralTokenMetrics = async (
  api,
  collateralToken,
  aggregatedMetrics,
  collateralAmounts
) => {
  if (!aggregatedMetrics[collateralToken]) {
    const collateralBalance =
      collateralAmounts[collateralToken] || new BigNumber(0);
    api.add(collateralToken, collateralBalance.toFixed(0));
  }
};

// Main function to get metrics
const getMetrics = async (api, borrowed) => {
  const marketsData = await fetchMarketsData(whitelistedIds, api);
  const collateralTokens = new Set();
  const aggregatedMetrics = marketsData.reduce((acc, market) => {
    const { loanToken, collateralToken, totalSupply, totalBorrow } =
      processMarketData(market);
    collateralTokens.add(collateralToken);

    acc[loanToken] = acc[loanToken] || {
      totalSupply: new BigNumber(0),
      totalBorrow: new BigNumber(0),
    };
    acc[loanToken].totalSupply = acc[loanToken].totalSupply.plus(totalSupply);
    acc[loanToken].totalBorrow = acc[loanToken].totalBorrow.plus(totalBorrow);

    return acc;
  }, {});

  const collateralAmounts = await getCollateralTokensBalanceOf(
    api,
    Array.from(collateralTokens)
  );

  for (const loanToken of Object.keys(aggregatedMetrics)) {
    const metric = computeMetrics(
      aggregatedMetrics,
      loanToken,
      collateralAmounts,
      borrowed
    );
    api.add(loanToken, metric);
  }

  if (!borrowed) {
    for (const collateralToken of collateralTokens) {
      await addCollateralTokenMetrics(
        api,
        collateralToken,
        aggregatedMetrics,
        collateralAmounts
      );
    }
  }
};

const ethereum = (borrowed) => {
  return async (timestamp, block, _, { api }) => getMetrics(api, borrowed);
};

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
  doublecounted: true,
  ethereum: {
    tvl: ethereum(false),
    borrowed: ethereum(true),
  },
};
