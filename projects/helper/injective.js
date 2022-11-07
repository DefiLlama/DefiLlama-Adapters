const { getNetworkInfo, Network } = require('@injectivelabs/networks')
const { protoObjectToJson, IndexerGrpcSpotApi } = require('@injectivelabs/sdk-ts')
const { sliceIntoChunks } = require('../helper/utils')
let clients = {}

const p2j = str => JSON.parse(protoObjectToJson(str))

function getClient(type = 'spot') {
  if (!clients[type]) {
    const network = getNetworkInfo(Network.Mainnet)
    switch(type) {
      case 'spot': clients[type] = new IndexerGrpcSpotApi(network.exchangeWeb3GatewayApi); break;
      default: throw new Error('Unknown type')
    }
  }
  return clients[type]
}

async function getMarkets({type = 'spot', marketStatus = 'active'} = {}) {
  const markets = await getClient(type).fetchMarkets({ marketStatus, })
  return p2j(markets)
}

async function getOrders({type = 'spot', marketIds}) {
  const chunks = sliceIntoChunks(marketIds, 20)
  const response = []
  for (const chunk of chunks)
    response.push(...await getClient(type).fetchOrderbooks(chunk))
  return response
}

module.exports = {
  getClient,
  p2j,
  getMarkets,
  getOrders,
}