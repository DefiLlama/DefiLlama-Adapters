const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ADDRESS_ZERO: ADDRESSES.null,
  OPTION_TYPE_PUT: 0,
  OPTION_TYPE_CALL: 1,
  EXPIRATION_START_FROM: 1605000000,
  NETWORK_POLYGON: {
    id: 137,
    name: 'polygon',
    subgraph: 'https://api.thegraph.com/subgraphs/name/pods-finance/pods-matic'
  },
  NETWORK_MAINNET: {
    id: 1,
    name: 'ethereum',
    subgraph: 'https://api.thegraph.com/subgraphs/name/pods-finance/pods'
  },
  NETWORK_ARBITRUM: {
    id: 42161,
    name: 'arbitrum',
    subgraph: 'https://api.thegraph.com/subgraphs/name/pods-finance/pods-arbitrum'
  }
}
