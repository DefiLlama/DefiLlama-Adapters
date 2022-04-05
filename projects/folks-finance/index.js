const algosdk = require("algosdk");
const { toUSDTBalances } = require("../helper/balances");

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
];

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

/* Get total deposits */
async function tvl() {
  const prices = await getPrices();
  let totalDeposit = 0;

  for (const pool of pools) {
    const state = await getAppState(pool.appId);

    const totalDeposits = getParsedValueFromState(state, "total_deposits");
    const depositAmountUsd = Number(totalDeposits) * prices[pool.assetId];

    totalDeposit += depositAmountUsd;
  }

  return totalDeposit;
}

/* Get total borrows */
async function borrowed() {
  const prices = await getPrices();

  let totalBorrow = 0;

  for (const pool of pools) {
    const state = await getAppState(pool.appId);

    const borrowAmount = getParsedValueFromState(state, "total_borrows");
    const borrowAmountUsd = Number(borrowAmount) * prices[pool.assetId];

    totalBorrow += borrowAmountUsd;
  }

  return totalBorrow;
}

module.exports = {
  fetch: tvl,
  borrowed: {
    fetch: borrowed,
  },
};
