const ADDRESSES = require('../coreAssets.json')
const sdk = require("@defillama/sdk");
const http = require("../http");
const { getEnv } = require("../env");
const { transformBalances } = require("../portedTokens");
const rpcURL = () => getEnv("SUPRA_RPC");

const MAX_NUM_OF_ITEMS_IN_PAGINATION_REQUEST = 10;
const COIN_INFO_STRUCT_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000001::coin::CoinInfo";

const sendGetRequest = async (endpoint) => {
  return await http.get(`${rpcURL()}${endpoint}`);
};

const sendPostRequest = async (endpoint, data) => {
  return await http.post(`${rpcURL()}${endpoint}`, data);
};

const getAccountAllResources = async (accountAddress) => {
  let allResourcesList = [];
  let endpointWithoutCursor = `/rpc/v1/accounts/${accountAddress}/resources?count=${MAX_NUM_OF_ITEMS_IN_PAGINATION_REQUEST}`;
  let resData = (await sendGetRequest(endpointWithoutCursor)).Resources;
  while (resData.resource.length != 0) {
    allResourcesList.push(...resData.resource);
    let endpointWithCursor = `${endpointWithoutCursor}&start=${resData.cursor}`;
    resData = (await sendGetRequest(endpointWithCursor)).Resources;
  }
  return allResourcesList;
};

const getResourceData = async (accountAddress, resourceType) => {
  let endpoint = `/rpc/v1/accounts/${accountAddress}/resources/${resourceType}`;
  let resData = await sendGetRequest(endpoint);
  if (!resData.result[0]) {
    throw new Error(
      `${resourceType} resource not found on ${accountAddress} address`
    );
  }
  return resData.result[0];
};

const invokeViewFunction = async (
  functionIdentifier,
  typeArguments,
  functionArguments
) => {
  let endpoint = "/rpc/v1/view";
  let data = {
    function: functionIdentifier,
    type_arguments: typeArguments,
    arguments: functionArguments,
  };
  return (await sendPostRequest(endpoint, data)).result;
};

const getTableItemByKey = async (tableHandle, keyType, valueType, key) => {
  let endpoint = `/rpc/v1/tables/${tableHandle}/item`;
  let data = {
    key_type: keyType,
    value_type: valueType,
    key: key,
  };
  return (await sendPostRequest(endpoint, data)).data;
};

const NATIVE_SUPRA_COIN = ADDRESSES.supra.SUPRA;
const EVM_NULL_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x0",
]);

async function getCoinBalance(owner, coinType) {
  const resource = `0x1::coin::CoinStore<${coinType}>`;
  const endpoint = `/rpc/v1/accounts/${owner}/resources/${encodeURIComponent(resource)}`;
  const data = await sendGetRequest(endpoint);
  return data?.result?.[0]?.coin?.value ?? 0;
}

async function sumTokens({ balances = {}, owners = [], tokens = [], blacklistedTokens = [], api } = {}) {
  const chain = api?.chain ?? "supra";
  const blacklist = new Set(blacklistedTokens);
  const coinTypes = new Set();
  for (const t of tokens) {
    if (blacklist.has(t)) continue;
    coinTypes.add(EVM_NULL_ADDRESSES.has(t) ? NATIVE_SUPRA_COIN : t);
  }
  if (coinTypes.size === 0) coinTypes.add(NATIVE_SUPRA_COIN);

  await Promise.all(
    owners.flatMap((owner) =>
      [...coinTypes].map(async (coinType) => {
        const value = await getCoinBalance(owner, coinType);
        if (value && value !== "0") sdk.util.sumSingleBalance(balances, coinType, value);
      })
    )
  );
  return transformBalances(chain, balances);
}

module.exports = {
  rpcURL,
  getAccountAllResources,
  getResourceData,
  invokeViewFunction,
  getTableItemByKey,
  COIN_INFO_STRUCT_TYPE,
  getCoinBalance,
  sumTokens,
};