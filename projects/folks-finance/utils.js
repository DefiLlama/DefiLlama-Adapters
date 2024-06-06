const { lookupApplications } = require("../helper/chain/algorand");
const { encodeAddress } = require("../helper/chain/algorandUtils/address");

function fromIntToBytes8Hex(num) {
  return num.toString(16).padStart(16, "0");
}

function encodeToBase64(str, encoding = "utf8") {
  return Buffer.from(str, encoding).toString("base64");
}

function parseOracleValue(base64Value) {
  const value = Buffer.from(base64Value, "base64").toString("hex");
  // first 8 bytes are the price
  const price = BigInt("0x" + value.slice(0, 16));

  return price;
}

function parseOracleAdapterValue(base64Value) {
  const value = Buffer.from(base64Value, "base64").toString("hex");
  // first 8 bytes are if Tinyman
  const isTinyman = Number(`0x${value.slice(0, 16)}`);
  // next 16 bytes are asset ids
  const asset0Id = Number(`0x${value.slice(16, 32)}`);
  const asset1Id = Number(`0x${value.slice(32, 48)}`);

  // check if LP token is Tinyman or Pact
  if (isTinyman) {
    // next 32 bytes are tinyman pool address
    const poolAddress = encodeAddress(Buffer.from(value.slice(48, 112), "hex"));
    return { provider: "Tinyman", asset0Id, asset1Id, poolAddress };
  } else {
    // next 8 bytes are pact pool app id
    const poolAppId = Number(`0x${value.slice(48, 64)}`);
    return { provider: "Pact", asset0Id, asset1Id, poolAppId };
  }
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
  const res = await lookupApplications(appId);
  return res.application.params["global-state"];
}

/**
 * Calculate the sqrt of a bigint (rounded down to nearest integer)
 * @param value value to be square-rooted
 * @return bigint sqrt
 */
function sqrt(value) {
  if (value < BigInt(0))
    throw Error("square root of negative numbers is not supported");

  if (value < BigInt(2)) return value;

  function newtonIteration(n, x0) {
    const x1 = (n / x0 + x0) >> BigInt(1);
    if (x0 === x1 || x0 === x1 - BigInt(1)) return x0;
    return newtonIteration(n, x1);
  }

  return newtonIteration(value, BigInt(1));
}

/**
 * Calculates the LP price
 * @param r0 pool supply of asset 0
 * @param r1 pool supply of asset 1
 * @param p0 price of asset 0
 * @param p1 price of asset 1
 * @param lts circulating supply of liquidity token
 * @return bigint LP price
 */
function calcLPPrice(r0, r1, p0, p1, lts) {
  return BigInt(2) * (sqrt(r0 * p0 * r1 * p1) / lts);
}

function isTinymanLPTokenPool(pool) {
  return "poolAppAddress" in pool;
}

function isPactLPTokenPool(pool) {
  return "poolAppId" in pool;
}

module.exports = {
  fromIntToBytes8Hex,
  encodeToBase64,
  parseOracleValue,
  parseOracleAdapterValue,
  getParsedValueFromState,
  getAppState,
  isTinymanLPTokenPool,
  isPactLPTokenPool,
  calcLPPrice,
};
