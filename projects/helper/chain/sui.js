
const sdk = require('@defillama/sdk')

const http = require('../http')
const env = require('../env')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses } = require('../utils')

const coreTokens = []

//https://docs.sui.io/sui-jsonrpc

const endpoint = env.SUI_RPC || "https://fullnode.mainnet.sui.io/"

async function getObject(objectId) {
  return (await call('sui_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function getObjects(objectIds) {
  const {
    result
  } = await http.post(endpoint, { jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }], })
  return  objectIds.map(i => result.find(j => j.data.objectId === i)?.data?.content)
}

async function getDynamicFieldObject(parent, id) {
  return (await call('suix_getDynamicFieldObject', [parent, {
    "type": "0x2::object::ID",
    "value": id
}])).content
}

async function call(method, params) {
  if (!Array.isArray(params)) params = [params]
  const {
    result: { data }
  } = await http.post(endpoint, { jsonrpc: "2.0", id: 1, method, params, })
  return data
}

async function multiCall(calls) {
  return Promise.all(calls.map(i => call(...i)))
}

module.exports = {
  endpoint,
  call,
  multiCall,
  getObject,
  getObjects,
  getDynamicFieldObject,
};
