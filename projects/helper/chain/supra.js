const ADDRESSES = require('../coreAssets.json')
const sdk = require("@defillama/sdk");
const http = require("../http");
const { getEnv } = require("../env");
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

module.exports = {
  rpcURL,
  getAccountAllResources,
  getResourceData,
  invokeViewFunction,
  getTableItemByKey,
  COIN_INFO_STRUCT_TYPE,
};