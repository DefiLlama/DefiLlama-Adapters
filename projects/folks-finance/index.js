const algosdk = require("algosdk");

const client = new algosdk.Indexer(
  "",
  "https://algoindexer.algoexplorerapi.io/",
  ""
);

const pools = [
  {
    // Algo
    appId: 686498781,
    assetId: 0,
    assetDecimals: 6,
  },
  {
    // USDC
    appId: 686500029,
    assetId: 31566704,
    assetDecimals: 6,
  },
  {
    // USDt
    appId: 686500844,
    assetId: 312769,
    assetDecimals: 6,
  },
  {
    // goBTC
    appId: 686501760,
    assetId: 386192725,
    assetDecimals: 8,
  },
  {
    // goETH
    appId: 694405065,
    assetId: 386195940,
    assetDecimals: 8,
  },
  {
    // gAlgo3
    appId: 694464549,
    assetId: 694432641,
    assetDecimals: 6,
  },
];

const liquidGovernanceAppId = 694427622;

const oracleAppId = 687039379;
const oracleDecimals = 14;

function fromIntToBytes8Hex(num) {
  return num.toString(16).padStart(16, "0");
}

function encodeToBase64(str, encoding = "utf8") {
  return Buffer.from(str, encoding).toString("base64");
}

function parseOracleValue(base64Value) {
  const value = Buffer.from(base64Value, "base64").toString("hex");
  // first 8 bytes are the price
  return BigInt("0x" + value.slice(0, 16));
}

function getParsedValueFromState(state, key, encoding = "utf8") {
  const encodedKey = encoding ? encodeToBase64(key, encoding) : key;
  const keyValue = state.find((entry) => entry.key === encodedKey);
  if (keyValue === undefined) return;
  const { value } = keyValue;
  if (value.type === 1) return value.bytes;
  if (value.type === 2) return BigInt(value.uint);
  return;
}

async function getAppState(appId) {
  const res = await client.lookupApplications(appId).do();
  return res.application.params["global-state"];
}

/* Get prices from oracle */
async function getPrices() {
  const state = await getAppState(oracleAppId);
  const prices = {};

  for (const pool of pools) {
    const base64Value = String(
      getParsedValueFromState(state, fromIntToBytes8Hex(pool.assetId), "hex")
    );
    const price = parseOracleValue(base64Value);
    prices[pool.assetId] = Number(price) / 10 ** oracleDecimals;
  }

  return prices;
}

async function getAlgoLiquidGovernanceDepositUsd(prices) {
  const [app, acc] = await Promise.all([
    client.lookupApplications(liquidGovernanceAppId).do(),
    client
      .lookupAccountByID(algosdk.getApplicationAddress(liquidGovernanceAppId))
      .do(),
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

  const [depositsAmountUsd, algoLiquidGovernanceDepositUsd] = await Promise.all(
    [getTotalPoolDepositsUsd(prices), getAlgoLiquidGovernanceDepositUsd(prices)]
  );

  return depositsAmountUsd + algoLiquidGovernanceDepositUsd;
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

module.exports = {
  fetch: tvl,
  borrowed: {
    fetch: borrowed,
  },
};
