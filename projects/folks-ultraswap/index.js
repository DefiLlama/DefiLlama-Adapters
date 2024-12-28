const { toUSDTBalances } = require("../helper/balances");
const { searchAccountsAll } = require("../helper/chain/algorand");
const {
  ULTRASWAP_UP_LOAN_APP_ID,
  ULTRASWAP_DOWN_LOAN_APP_ID,
} = require("./constants");
const { userLoanInfo, retrieveLoanInfo } = require("./loan-info");
const { loanLocalState } = require("./loan-local-state");
const { retrievePoolManagerInfo } = require("./pool-manager");
const { getCachedPrices } = require("./prices");

async function calculateTvlOnUltraswapLoan(loanAppId, poolManagerInfo, prices) {
  const accountsWithLoans = await searchAccountsAll({
    appId: loanAppId,
    searchParams: { exclude: "assets,created-assets,created-apps" },
  });

  const loanInfo = await retrieveLoanInfo(loanAppId);

  let totalCollateralUsd = 0;
  let totalBorrowUsd = 0;

  for (const accountWithLoans of accountsWithLoans) {
    const state = accountWithLoans["apps-local-state"]?.find(
      ({ id }) => id === loanAppId
    )?.["key-value"];
    const localState = loanLocalState(state);

    const loan = userLoanInfo(localState, poolManagerInfo, loanInfo, prices);
    totalCollateralUsd += loan.totalCollateralBalanceValue;
    totalBorrowUsd += loan.totalBorrowBalanceValue;
  }

  return { totalCollateralUsd, totalBorrowUsd };
}

let data

async function getUltraswapData() {
  if (!data) {
    data = _getUltraswapData();
  }
  return data;
}

async function _getUltraswapData() {
  const prices = await getCachedPrices();
  const poolManagerInfo = await retrievePoolManagerInfo();

  const ultraswapUpTvl = await calculateTvlOnUltraswapLoan(
    ULTRASWAP_UP_LOAN_APP_ID,
    poolManagerInfo,
    prices
  );
  const ultraswapDownTvl = await calculateTvlOnUltraswapLoan(
    ULTRASWAP_DOWN_LOAN_APP_ID,
    poolManagerInfo,
    prices
  );

  const totalBorrowUsd =
    ultraswapUpTvl.totalBorrowUsd + ultraswapDownTvl.totalBorrowUsd;
  const totalCollateralUsd =
    ultraswapUpTvl.totalCollateralUsd + ultraswapDownTvl.totalCollateralUsd;

  return { totalBorrowUsd, totalCollateralUsd };
}

async function tvl() {
  const { totalBorrowUsd, totalCollateralUsd } = await getUltraswapData();

  return toUSDTBalances(totalCollateralUsd + totalBorrowUsd);
}

async function borrowed() {
  const { totalBorrowUsd } = await getUltraswapData();

  return toUSDTBalances(totalBorrowUsd);
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  algorand: { tvl, borrowed },
};
