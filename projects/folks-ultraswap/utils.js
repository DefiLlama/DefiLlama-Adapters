const { lookupApplications } = require("../helper/chain/algorand");
const { encodeAddress } = require("../helper/chain/algorandUtils/address");

const ONE_4_DP = BigInt(1e4);
const ONE_14_DP = BigInt(1e14);
const ONE_16_DP = BigInt(1e16);
const SECONDS_IN_YEAR = BigInt(365 * 24 * 60 * 60);

function fromIntToBytes8Hex(num) {
  return num.toString(16).padStart(16, "0");
}

function fromIntToByteHex(num) {
  return num.toString(16).padStart(2, "0");
}

function encodeToBase64(str, encoding = "utf8") {
  return Buffer.from(str, encoding).toString("base64");
}

function parseUint64s(base64Value) {
  const value = Buffer.from(base64Value, "base64").toString("hex");

  // uint64s are 8 bytes each
  const uint64s = [];
  for (let i = 0; i < value.length; i += 16) {
    uint64s.push(BigInt("0x" + value.slice(i, i + 16)));
  }
  return uint64s;
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

function unixTime() {
  return Math.floor(Date.now() / 1000);
}

function mulScale(n1, n2, scale) {
  return (n1 * n2) / scale;
}

function mulScaleRoundUp(n1, n2, scale) {
  return mulScale(n1, n2, scale) + BigInt(1);
}

function divScale(n1, n2, scale) {
  return (n1 * scale) / n2;
}

function divScaleRoundUp(n1, n2, scale) {
  return divScale(n1, n2, scale) + BigInt(1);
}

function expBySquaring(x, n, scale) {
  if (n === BigInt(0)) return scale;

  let y = scale;
  while (n > BigInt(1)) {
    if (n % BigInt(2)) {
      y = mulScale(x, y, scale);
      n = (n - BigInt(1)) / BigInt(2);
    } else {
      n = n / BigInt(2);
    }
    x = mulScale(x, x, scale);
  }
  return mulScale(x, y, scale);
}

module.exports = {
  ONE_4_DP,
  ONE_14_DP,
  ONE_16_DP,
  SECONDS_IN_YEAR,
  fromIntToByteHex,
  fromIntToBytes8Hex,
  encodeToBase64,
  parseUint64s,
  parseOracleValue,
  parseOracleAdapterValue,
  getParsedValueFromState,
  getAppState,
  unixTime,
  mulScale,
  mulScaleRoundUp,
  divScale,
  divScaleRoundUp,
  expBySquaring,
};
