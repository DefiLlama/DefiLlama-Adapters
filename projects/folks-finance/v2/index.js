const { getAppState, getParsedValueFromState } = require("../utils");
const { pools } = require("./constants");
const { getCachedPrices } = require("./prices");

function parseUint64s(base64Value) {
  const value = Buffer.from(base64Value, "base64").toString("hex");

  // uint64s are 8 bytes each
  const uint64s = [];
  for (let i = 0; i < value.length; i += 16) {
    uint64s.push(BigInt("0x" + value.slice(i, i + 16)));
  }
  return uint64s;
}

async function retrievePoolInfo({ poolAppId, poolAssetId }) {
  const state = await getAppState(poolAppId);

  if (state === undefined)
    return {
      depositsUsd: 0,
      borrowsUsd: 0,
    };

  const prices = await getCachedPrices();
  const price = prices[poolAssetId];
  if (price === undefined) return { depositsUsd: 0, borrowsUsd: 0 };

  const varBor = parseUint64s(String(getParsedValueFromState(state, "v")));
  const stblBor = parseUint64s(String(getParsedValueFromState(state, "s")));
  const interest = parseUint64s(String(getParsedValueFromState(state, "i")));

  const variableBorrowAmountUsd = Number(varBor[3]) * price;
  const stableBorrowAmountUsd = Number(stblBor[8]) * price;
  const borrowsAmountUsd = variableBorrowAmountUsd + stableBorrowAmountUsd;
  const depositsAmountUsd = Number(interest[3]) * price;

  // combine
  return {
    depositsUsd: depositsAmountUsd,
    borrowsUsd: borrowsAmountUsd,
  };
}

async function getPoolsInfo() {
  const promises = pools.map(async (pool) =>
    retrievePoolInfo({ poolAppId: pool.appId, poolAssetId: pool.assetId })
  );
  const poolsInfo = await Promise.all(promises);

  return poolsInfo.reduce(
    (acc, poolInfo) => {
      acc.totalDepositsUsd += poolInfo.depositsUsd;
      acc.totalBorrowsUsd += poolInfo.borrowsUsd;
      return acc;
    },
    { totalDepositsUsd: 0, totalBorrowsUsd: 0 }
  );
}

/* Get total deposits */
async function tvl() {
  const { totalDepositsUsd, totalBorrowsUsd } = await getPoolsInfo();

  return totalDepositsUsd - totalBorrowsUsd;
}

/* Get total borrows */
async function borrows() {
  const { totalBorrowsUsd } = await getPoolsInfo();

  return totalBorrowsUsd;
}

module.exports = {
  v2TvlUsd: tvl,
  v2BorrowedBalancesUsd: borrows,
};
