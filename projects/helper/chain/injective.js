const { getNetworkInfo, Network } = require('@injectivelabs/networks')
const { protoObjectToJson, DenomClient, IndexerGrpcSpotApi, IndexerGrpcDerivativesApi, ChainGrpcBankApi } = require('@injectivelabs/sdk-ts')
const { TokenType } = require('@injectivelabs/token-metadata')
const { default: BigNumber } = require('bignumber.js')

const { sliceIntoChunks } = require('../utils')
let clients = {}

const TYPES = {
  BANK: 'BANK',
  SPOT: 'SPOT',
  DERIVATIVES: 'DERIVATIVES',
}

const p2j = str => JSON.parse(protoObjectToJson(str))

function getClient(type = TYPES.SPOT) {
  if (!clients[type]) {
    const network = getNetworkInfo(Network.Mainnet)
    if (type === TYPES.SPOT)
      clients[type] = new IndexerGrpcSpotApi(network.indexer);
    else if (type === TYPES.DERIVATIVES)
      clients[type] = new IndexerGrpcDerivativesApi(network.indexer)
    else if(type === TYPES.BANK)
    clients[type] = new ChainGrpcBankApi(network.grpc)
    else
      throw new Error('Unknown type')
  }
  return clients[type]
}

function getDenomClient() {
  const network = getNetworkInfo(Network.Mainnet)
  return new DenomClient(network.grpc)
}

async function getMarkets({ type = TYPES.SPOT, marketStatus = 'active' } = {}) {
  const markets = await getClient(type).fetchMarkets({ marketStatus, })
  return p2j(markets)
}

async function getOrders({ type = TYPES.SPOT, marketIds }) {
  const chunks = sliceIntoChunks(marketIds, 20)
  const response = []
  for (const chunk of chunks)
    response.push(...await getClient(type).fetchOrderbooksV2(chunk))
  return response
}

async function getAssets(type = TYPES.BANK) {
  const denomClient = getDenomClient();
  const { supply } = await getClient(type).fetchAllTotalSupply();
  const supplyWithTokensOrUnknown = supply.map((coin) =>
    denomClient.getDenomToken(coin.denom)
  ).filter(token => token);
  const supplyWithToken = supplyWithTokensOrUnknown.filter(
    (token) => token.tokenType !== TokenType.Unknown
  );
  const assets = supplyWithToken.map((token) => ({
    token,
    ...supply.find((coin) => coin.denom === token.denom)
  }));
  return assets
}

function formatTokenAmounts(balances) {
  const denomClient = getDenomClient();
  return Object.entries(balances).reduce((formattedAmounts, [denom, amount]) => {
    const token = denomClient.getDenomToken(denom)
    if(!token || !token.decimals || !token.coinGeckoId) {
      return formattedAmounts
    }
    const formattedAmount = new BigNumber(amount).div(10 ** token.decimals).toFixed(2)
    formattedAmounts[token.coinGeckoId] = formattedAmount;
    return formattedAmounts
  }, {});
}

module.exports = {
  TYPES,
  getClient,
  p2j,
  getMarkets,
  getOrders,
  getAssets,
  formatTokenAmounts
}
