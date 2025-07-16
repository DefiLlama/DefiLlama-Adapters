
const sdk = require('@defillama/sdk')

const http = require('../http')
const { getEnv } = require('../env')

const endpoint = () => getEnv('IOTA_RPC')

async function getObject(objectId) {
  return (await call('iota_getObject', [objectId, {
    "showType": true,
    "showOwner": true,
    "showContent": true,
  }])).content
}

async function call(method, params, { withMetadata = false } = {}) {
  if (!Array.isArray(params)) params = [params]
  const {
    result, error
  } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params, })
  if (!result && error) throw new Error(`[iota] ${error.message}`)
  if (['iotax_getAllBalances'].includes(method)) return result
  return withMetadata ? result : result.data
}

module.exports = {
  endpoint: endpoint(),
  call,
  getObject,
};
