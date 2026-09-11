const { toUSDTBalances } = require("../helper/balances");
const { searchAccountsAll } = require("../helper/chain/algorand");
const { encodeAddress } = require("../helper/chain/algorandUtils/address");
const POOL_MANAGER_APP_ID = 971350278;

const ULTRASWAP_UP_LOAN_APP_ID = 1202382736;
const ULTRASWAP_DOWN_LOAN_APP_ID = 1202382829;

const ORACLE_APP_ID = 1040271396;
const ORACLE_DECIMALS = 14;
const {
  parseUint64s,
  getParsedValueFromState,
  getAppState,
  unixTime,
  mulScale,
  ONE_16_DP,
  SECONDS_IN_YEAR,
  expBySquaring,
  fromIntToByteHex,
  fromIntToBytes8Hex,
  parseOracleValue,
} = require("./utils");
const { userLoanInfo, retrieveLoanInfo } = require("./loan-info");

// inlined from ./loan-local-state
function loanLocalState(state) {
  // standard
  const userAddress = encodeAddress(
    Buffer.from(String(getParsedValueFromState(state, "u")), "base64")
  );
  const colPls = parseUint64s(String(getParsedValueFromState(state, "c")));
  const borPls = parseUint64s(String(getParsedValueFromState(state, "b")));
  const colBals = parseUint64s(String(getParsedValueFromState(state, "cb")));
  const borAms = parseUint64s(String(getParsedValueFromState(state, "ba")));
  const borBals = parseUint64s(String(getParsedValueFromState(state, "bb")));
  const lbii = parseUint64s(String(getParsedValueFromState(state, "l")));
  const sbir = parseUint64s(String(getParsedValueFromState(state, "r")));
  const lsc = parseUint64s(String(getParsedValueFromState(state, "t")));

  // custom
  const collaterals = [];
  const borrows = [];
  for (let i = 0; i < 15; i++) {
    // add collateral
    collaterals.push({
      poolAppId: Number(colPls[i]),
      fAssetBalance: colBals[i],
    });

    // add borrow
    borrows.push({
      poolAppId: Number(borPls[i]),
      borrowedAmount: borAms[i],
      borrowBalance: borBals[i],
      latestBorrowInterestIndex: lbii[i],
      stableBorrowInterestRate: sbir[i],
      latestStableChange: lsc[i],
    });
  }

  return {
    userAddress,
    collaterals,
    borrows,
  };
}

// inlined from ./pool-manager
function calcBorrowInterestIndex(birt1, biit1, latestUpdate) {
  const dt = BigInt(unixTime()) - latestUpdate;
  return mulScale(
    biit1,
    expBySquaring(ONE_16_DP + birt1 / SECONDS_IN_YEAR, dt, ONE_16_DP),
    ONE_16_DP
  );
}

function calcDepositInterestIndex(dirt1, diit1, latestUpdate) {
  const dt = BigInt(unixTime()) - latestUpdate;
  return mulScale(diit1, ONE_16_DP + (dirt1 * dt) / SECONDS_IN_YEAR, ONE_16_DP);
}

async function retrievePoolManagerInfo() {
  const state = await getAppState(POOL_MANAGER_APP_ID);
  if (state === undefined) throw Error("Could not find Pool Manager");

  const pools = {};
  for (let i = 0; i < 63; i++) {
    const poolBase64Value = String(
      getParsedValueFromState(state, fromIntToByteHex(i), "hex")
    );

    const poolValue = Buffer.from(poolBase64Value, "base64").toString("hex");

    for (let j = 0; j < 3; j++) {
      const basePos = j * 84;
      const poolAppId = Number("0x" + poolValue.slice(basePos, basePos + 12));

      // add pool
      if (poolAppId > 0) {
        const vbir = BigInt("0x" + poolValue.slice(basePos + 12, basePos + 28));
        const vbiit1 = BigInt(
          "0x" + poolValue.slice(basePos + 28, basePos + 44)
        );
        const dir = BigInt("0x" + poolValue.slice(basePos + 44, basePos + 60));
        const diit1 = BigInt(
          "0x" + poolValue.slice(basePos + 60, basePos + 76)
        );
        const lu = BigInt("0x" + poolValue.slice(basePos + 76, basePos + 84));

        const depositInterestIndex = calcDepositInterestIndex(dir, diit1, lu);
        const variableBorrowInterestIndex = calcBorrowInterestIndex(
          vbir,
          vbiit1,
          lu
        );

        pools[poolAppId] = {
          depositInterestIndex,
          variableBorrowInterestIndex,
        };
      }
    }
  }

  return { pools };
}

// inlined from ./prices
function decodeUint64(data, decodingMode = "safe") {
  if (
    decodingMode !== "safe" &&
    decodingMode !== "mixed" &&
    decodingMode !== "bigint"
  ) {
    throw new Error(`Unknown decodingMode option: ${decodingMode}`);
  }

  if (data.byteLength === 0 || data.byteLength > 8) {
    throw new Error(
      `Data has unacceptable length. Expected length is between 1 and 8, got ${data.byteLength}`
    );
  }

  // insert 0s at the beginning if data is smaller than 8 bytes
  const padding = Buffer.allocUnsafe(8 - data.byteLength);
  padding.fill(0);

  const buf = Buffer.concat([padding, Buffer.from(data)]);

  const num = buf.readBigUInt64BE();
  const isBig = num > Number.MAX_SAFE_INTEGER;

  if (decodingMode === "safe") {
    if (isBig) {
      throw new Error(
        `Integer exceeds maximum safe integer: ${num.toString()}. Try decoding with "mixed" or "safe" decodingMode.`
      );
    }
    return Number(num);
  }

  if (decodingMode === "mixed" && !isBig) {
    return Number(num);
  }

  return num;
}

let pricesCache;

async function getCachedPrices() {
  if (!pricesCache) pricesCache = getPrices();
  return pricesCache;
}

/* Get prices from oracle */
async function getPrices() {
  const oracleState = await getAppState(ORACLE_APP_ID);

  const prices = {};

  // get the assets for which we need to retrieve their prices
  const assets = oracleState
    .filter(({ key }) => {
      // remove non asset ids global state
      key = Buffer.from(key, "base64").toString("utf8");
      return (
        key !== "updater_addr" &&
        key !== "admin" &&
        key !== "tinyman_validator_app_id"
      );
    })
    .map(({ key }) => {
      // convert key to asset id
      return decodeUint64(Buffer.from(key, "base64"), "safe");
    });

  // retrieve asset prices
  assets.forEach((assetId) => {
    const assetPrice = parseOracleValue(
      String(
        getParsedValueFromState(oracleState, fromIntToBytes8Hex(assetId), "hex")
      )
    );

    prices[assetId] = Number(assetPrice) / 10 ** ORACLE_DECIMALS;
  });

  return prices;
}

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
