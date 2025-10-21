const { oracleAppId, oracleDecimals } = require("./constants");
const {
  getAppState,
  getParsedValueFromState,
  fromIntToBytes8Hex,
  parseOracleValue,
} = require("./utils");

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
  const oracleState = await getAppState(oracleAppId);

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

    prices[assetId] = Number(assetPrice) / 10 ** oracleDecimals;
  });

  return prices;
}

module.exports = { getCachedPrices };
