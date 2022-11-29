const { getNetworkInfo, Network } = require('@injectivelabs/networks')
const { protoObjectToJson, IndexerGrpcSpotApi, IndexerGrpcDerivativesApi } = require('@injectivelabs/sdk-ts')
const { sliceIntoChunks } = require('../utils')
let clients = {}

const TYPES = {
  SPOT: 'SPOT',
  DERIVATIVES: 'DERIVATIVES',
}

const p2j = str => JSON.parse(protoObjectToJson(str))

function getClient(type = TYPES.SPOT) {
  if (!clients[type]) {
    const network = getNetworkInfo(Network.Mainnet)
    if (type === TYPES.SPOT)
      clients[type] = new IndexerGrpcSpotApi(network.exchangeWeb3GatewayApi);
    else if (type === TYPES.DERIVATIVES)
      clients[type] = new IndexerGrpcDerivativesApi(network.exchangeWeb3GatewayApi)
    else
      throw new Error('Unknown type')
  }
  return clients[type]
}

async function getMarkets({ type = TYPES.SPOT, marketStatus = 'active' } = {}) {
  const markets = await getClient(type).fetchMarkets({ marketStatus, })
  return p2j(markets)
}

async function getOrders({ type = TYPES.SPOT, marketIds }) {
  const chunks = sliceIntoChunks(marketIds, 20)
  const response = []
  for (const chunk of chunks)
    response.push(...await getClient(type).fetchOrderbooks(chunk))
  return response
}

module.exports = {
  TYPES,
  getClient,
  p2j,
  getMarkets,
  getOrders,
}