const axios = require("axios");

// https://github.com/massalabs/massa-web3/blob/main/packages/massa-web3/src/web3/PublicApiClient.ts
const RPC_ENDPOINT = "https://mainnet.massa.net/api/v2";
const client = axios.create({ baseURL: RPC_ENDPOINT });

async function request(method, params) {
  params.forEach((param) => {
    if (param.key)
      param.key = convertUnit8ArrayToNumberArray(param.key);
  })

  const response = await client.post("/", {
    jsonrpc: "2.0",
    method,
    params: [params],
    id: 1,
  })

  return response.data.result;

  function convertUnit8ArrayToNumberArray(unit8Array) {
    return Array.from(unit8Array, (byte) => byte)
  }
}

function u8ArrayToString(array) {
  let str = "";
  for (const byte of array) {
    str += String.fromCharCode(byte);
  }
  return str;
}

function strToBytes(str) {
  if (!str.length) {
    return new Uint8Array(0);
  }
  return new Uint8Array(Buffer.from(str, 'utf-8'));
}

function bytesToStr(bytes) {
  return u8ArrayToString(bytes).replace(/\0/g, '');
}


/**
 * Converts a Uint8Array into an unsigned 64-bit integer (u64) BigInt.
 *
 * @param arr - The array to convert
 * @param offset - The optional offset in the Uint8Array at which to start reading the u64 value (default: 0)
 *
 * @returns The deserialized u64 BigInt value
 *
 */
function bytesToU64(arr, offset = 0) {
  if (!arr?.length) return '0'
  arr = new Uint8Array(arr);
  const view = new DataView(arr.buffer);
  return view.getBigUint64(offset, true);
}

/**
 * Converts a Uint8Array into an unsigned 256-bit integer (u256) BigInt.
 *
 * @param arr - The array to convert
 * @param offset - The optional offset in the Uint8Array at which to start reading the u256 value (default: 0)
 *
 * @returns The deserialized u256BigInt value
 *
 */
function bytesToU256(arr, offset = 0) {
  if (!arr?.length) return '0'
  arr = new Uint8Array(arr);
  const view = new DataView(arr.buffer, offset);
  const p0 = view.getBigUint64(0, true);
  const p1 = view.getBigUint64(8, true);
  const p2 = view.getBigUint64(16, true);
  const p3 = view.getBigUint64(24, true);
  return (p3 << 192n) | (p2 << 128n) | (p1 << 64n) | p0;
}


async function queryKey(addresses, key, transform = val => u8ArrayToString(val)) {
  const res = await request('get_datastore_entries', addresses.map((address) => ({ address, key: strToBytes(key) })))
  return res.map((entry) => transform(entry.candidate_value));
}

const bytesToBigInt = (bytes) => {
  try {
    return bytesToU256(bytes);
  } catch (e) {
    return bytesToU64(bytes);
  }
};

async function getTokenBalances(tokenAddresses, ownerAddresses) {
  const params = tokenAddresses.map((tokenAddress, i) => ({
    address: tokenAddress,
    key: strToBytes(`BALANCE${ownerAddresses[i]}`)
  }))
  const res = await request('get_datastore_entries', params)
  return res.map((entry) => bytesToBigInt(entry.candidate_value).toString());
}

function convertUnit8ArrayToNumberArray(unit8Array) {
  return Array.from(unit8Array, (byte) => byte)
}


async function getAddresssDataStoreKeys(address, prefix, is_final) {
  const res = await request('get_addresses_datastore_keys', [{
    address: address,
    prefix: convertUnit8ArrayToNumberArray(prefix),
    is_final: is_final,
  }]);

  return res[0].keys;

}

module.exports = {
  queryKey,
  u8ArrayToString,
  getTokenBalances,
  getAddresssDataStoreKeys,
  bytesToStr,
  bytesToBigInt,
};