const { toUSDTBalances } = require("../helper/balances");

const {
  pools,
  liquidGovernance3AppId,
  liquidGovernanceAppId,
} = require("./constants");
const {
  lookupApplications,
  lookupAccountByID,
  getApplicationAddress,
} = require("../helper/algorand");
const { getAppState, getParsedValueFromState } = require("./utils");
const { getPrices } = require("./prices");

async function getAlgoLiquidGovernanceDepositUsd(
  prices,
  liquidGovernanceAppId
) {
  const [app, acc] = await Promise.all([
    lookupApplications(liquidGovernanceAppId),
    lookupAccountByID(getApplicationAddress(liquidGovernanceAppId)),
  ]);
  const state = app.application.params["global-state"];

  const gAlgoId = Number(getParsedValueFromState(state, "g_algo_id") || 0);
  const gAlgoBalance =
    acc.account.assets?.find((asset) => asset["asset-id"] === gAlgoId)
      ?.amount || 10e15;

  // 10e15 is the amount of gAlgo preminted by the governance contract (not in circulation)
  // gAlgoBalance is the amount still locked in the governance contract
  // totalMinted is the amount of gAlgo in circulation, and since gAlgo is 1:1 with Algo,
  // it represents the amount of Algo deposited and locked in the governance contract
  const totalMinted = 10e15 - gAlgoBalance;
  return totalMinted * prices[0];
}

async function getTotalPoolDepositsUsd(prices) {
  const promises = pools.map(async (pool) => {
    try {
      const state = await getAppState(pool.appId);
      const totalDeposits = getParsedValueFromState(state, "total_deposits");
      const numericDeposits = isNaN(Number(totalDeposits))
        ? 0
        : Number(totalDeposits);
      const depositAmountUsd = numericDeposits * prices[pool.assetId];

      return depositAmountUsd;
    } catch (e) {
      return 0;
    }
  });

  const depositsAmountUsd = await Promise.all(promises);
  const totalDepositsUsd = depositsAmountUsd.reduce((a, b) => a + b, 0);

  return totalDepositsUsd;
}

/* Get total deposits */
async function tvl() {
  const prices = await getPrices();

  const [
    depositsAmountUsd,
    algoLiquidGovernance3DepositUsd,
    algoLiquidGovernanceDepositUsd,
    borrowsAmountUsd,
  ] = await Promise.all([
    getTotalPoolDepositsUsd(prices),
    getAlgoLiquidGovernanceDepositUsd(prices, liquidGovernance3AppId),
    getAlgoLiquidGovernanceDepositUsd(prices, liquidGovernanceAppId),
    borrowed(),
  ]);

  return toUSDTBalances(
    depositsAmountUsd +
      algoLiquidGovernance3DepositUsd +
      algoLiquidGovernanceDepositUsd -
      borrowsAmountUsd
  );
}

/* Get total borrows */
async function borrowed() {
  const prices = await getPrices();

  const promises = pools.map(async (pool) => {
    try {
      const state = await getAppState(pool.appId);
      const borrowAmount = getParsedValueFromState(state, "total_borrows");
      const numericBorrowAmount = isNaN(Number(borrowAmount))
        ? 0
        : Number(borrowAmount);
      const borrowAmountUsd = numericBorrowAmount * prices[pool.assetId];

      return borrowAmountUsd;
    } catch (e) {
      return 0;
    }
  });

  const borrowsAmountUsd = await Promise.all(promises);
  const totalBorrowsUsd = borrowsAmountUsd.reduce((a, b) => a + b, 0);

  return totalBorrowsUsd;
}

async function borrowedBalances() {
  return toUSDTBalances(await borrowed());
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl,
    borrowed: borrowedBalances,
  },
};
