const {
  lookupAccountByID,
  lookupApplications,
} = require("../../helper/chain/algorand");
const {
  oracleAppId,
  oracleAdapterAppId,
  pools,
  tinymanValidatorAppId,
  oracleDecimals,
} = require("./constants");
const {
  getAppState,
  getParsedValueFromState,
  fromIntToBytes8Hex,
  parseOracleValue,
  parseOracleAdapterValue,
  calcLPPrice,
} = require("../utils");

async function getTinymanLPPrice(validatorAppId, poolAddress, p0, p1) {
  const res = await lookupAccountByID(poolAddress);
  const { account } = res;

  const state = account["apps-local-state"]?.find(
    (app) => app.id === validatorAppId
  )?.["key-value"];
  if (state === undefined)
    throw new Error(
      `Unable to find Tinyman Pool: ${poolAddress} for validator app ${validatorAppId}.`
    );
  const r0 = BigInt(getParsedValueFromState(state, "s1") || 0);
  const r1 = BigInt(getParsedValueFromState(state, "s2") || 0);
  const lts = BigInt(getParsedValueFromState(state, "ilt") || 0);

  return calcLPPrice(r0, r1, p0, p1, lts);
}

async function getPactLPPrice(poolAppId, p0, p1) {
  const res = await lookupApplications(poolAppId);
  const state = res.application.params["global-state"];

  const r0 = BigInt(getParsedValueFromState(state, "A") || 0);
  const r1 = BigInt(getParsedValueFromState(state, "B") || 0);
  const lts = BigInt(getParsedValueFromState(state, "L") || 0);

  return calcLPPrice(r0, r1, p0, p1, lts);
}

/* Get prices from oracle */
async function getPrices() {
  const oracleState = await getAppState(oracleAppId);
  const oracleAdapterState = await getAppState(oracleAdapterAppId);
  const prices = {};

  let price;
  for (const pool of pools) {
    const base64Value = getParsedValueFromState(
      oracleAdapterState,
      fromIntToBytes8Hex(pool.assetId),
      "hex"
    );

    // check if liquidity token
    if (base64Value !== undefined) {
      const oracleAdapterValue = parseOracleAdapterValue(base64Value);

      const price0 = parseOracleValue(
        String(
          getParsedValueFromState(
            oracleState,
            fromIntToBytes8Hex(oracleAdapterValue.asset0Id),
            "hex"
          )
        )
      );
      const price1 = parseOracleValue(
        String(
          getParsedValueFromState(
            oracleState,
            fromIntToBytes8Hex(oracleAdapterValue.asset1Id),
            "hex"
          )
        )
      );

      price =
        oracleAdapterValue.provider === "Tinyman"
          ? await getTinymanLPPrice(
              tinymanValidatorAppId,
              oracleAdapterValue.poolAddress,
              price0,
              price1
            )
          : await getPactLPPrice(oracleAdapterValue.poolAppId, price0, price1);
    } else {
      price = parseOracleValue(
        String(
          getParsedValueFromState(
            oracleState,
            fromIntToBytes8Hex(pool.assetId),
            "hex"
          )
        )
      );
    }

    prices[pool.assetId] = Number(price) / 10 ** oracleDecimals;
  }

  return prices;
}

module.exports = { getPrices };
