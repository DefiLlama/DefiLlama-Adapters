const {
  getParsedValueFromState,
  getAppState,
  mulScale,
  unixTime,
  ONE_16_DP,
  SECONDS_IN_YEAR,
  expBySquaring,
  mulScaleRoundUp,
  divScaleRoundUp,
  ONE_14_DP,
  fromIntToByteHex,
} = require("./utils");

function calcBorrowInterestIndex(birt1, biit1, latestUpdate) {
  const dt = BigInt(unixTime()) - latestUpdate;
  return mulScale(
    biit1,
    expBySquaring(ONE_16_DP + birt1 / SECONDS_IN_YEAR, dt, ONE_16_DP),
    ONE_16_DP
  );
}

function calcBorrowBalance(bbtn1, biit, biitn1) {
  return mulScaleRoundUp(
    bbtn1,
    divScaleRoundUp(biit, biitn1, ONE_14_DP),
    ONE_14_DP
  );
}

async function retrieveLoanInfo(loanAppId) {
  const state = await getAppState(loanAppId);
  if (state === undefined) throw Error("Could not find Loan");

  const paramsBase64Value = String(getParsedValueFromState(state, "pa"));
  const paramsValue = Buffer.from(paramsBase64Value, "base64").toString("hex");
  const canSwapCollateral = Boolean(BigInt("0x" + paramsValue.slice(96, 98)));

  const pools = {};
  for (let i = 0; i < 63; i++) {
    const poolBase64Value = String(
      getParsedValueFromState(state, fromIntToByteHex(i), "hex")
    );
    const poolValue = Buffer.from(poolBase64Value, "base64").toString("hex");

    for (let j = 0; j < 3; j++) {
      const basePos = j * 84;
      const poolAppId = Number("0x" + poolValue.slice(basePos, basePos + 16));
      // add pool
      if (poolAppId > 0) {
        pools[poolAppId] = {
          poolAppId,
          assetId: Number("0x" + poolValue.slice(basePos + 16, basePos + 32)),
        };
      }
    }
  }

  // combine
  return { canSwapCollateral, pools };
}

function userLoanInfo(localState, poolManagerInfo, loanInfo, prices) {
  const { pools: poolManagerPools } = poolManagerInfo;
  const { pools: loanPools } = loanInfo;

  // collaterals
  let totalCollateralBalanceValue = 0;

  localState.collaterals.forEach(({ poolAppId, fAssetBalance }) => {
    const isColPresent = poolAppId > 0;
    if (!isColPresent) return;

    const poolInfo = poolManagerPools[poolAppId];
    const poolLoanInfo = loanPools[poolAppId];
    if (poolInfo === undefined || poolLoanInfo === undefined)
      throw Error("Could not find collateral pool " + poolAppId);

    const { depositInterestIndex } = poolInfo;
    const { assetId } = poolLoanInfo;
    const assetPrice = prices[assetId];
    if (assetPrice === undefined)
      throw Error("Could not find asset price " + assetId);

    const assetBalance = mulScale(
      fAssetBalance,
      depositInterestIndex,
      ONE_14_DP
    );
    const balanceValue = Number(assetBalance) * assetPrice;

    totalCollateralBalanceValue += balanceValue;
  });

  // borrows
  let totalBorrowBalanceValue = 0;

  localState.borrows.forEach(
    ({
      poolAppId,
      borrowBalance: oldBorrowBalance,
      latestBorrowInterestIndex,
      stableBorrowInterestRate,
      latestStableChange,
    }) => {
      const isBorPresent = oldBorrowBalance > BigInt(0);
      if (!isBorPresent) return;

      const poolInfo = poolManagerPools[poolAppId];
      const poolLoanInfo = loanPools[poolAppId];
      if (poolInfo === undefined || poolLoanInfo === undefined)
        throw Error("Could not find borrow pool " + poolAppId);

      const { assetId } = poolLoanInfo;
      const assetPrice = prices[assetId];
      if (assetPrice === undefined)
        throw Error("Could not find asset price " + assetId);

      const isStable = latestStableChange > BigInt(0);
      const borrowInterestIndex = isStable
        ? calcBorrowInterestIndex(
            stableBorrowInterestRate,
            latestBorrowInterestIndex,
            latestStableChange
          )
        : poolInfo.variableBorrowInterestIndex;
      const borrowBalance = calcBorrowBalance(
        oldBorrowBalance,
        borrowInterestIndex,
        latestBorrowInterestIndex
      );

      const borrowBalanceValue = Number(borrowBalance) * assetPrice;

      totalBorrowBalanceValue += borrowBalanceValue;
    }
  );

  return {
    totalCollateralBalanceValue,
    totalBorrowBalanceValue,
  };
}

module.exports = {
  retrieveLoanInfo,
  userLoanInfo,
};
