const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ADDRESS_ZERO: ADDRESSES.null,
  OPTION_TYPE_PUT: 0,
  OPTION_TYPE_CALL: 1,
  EXPIRATION_START_FROM: 1605000000,
  NETWORK_POLYGON: {
    id: 137,
    name: 'polygon',
    subgraph: sdk.graph.modifyEndpoint('5yQETkt77T9htftwDSW4WJpoGkPH9KBQzQLzPnuyZ8ti')
  },
  NETWORK_MAINNET: {
    id: 1,
    name: 'ethereum',
    subgraph: sdk.graph.modifyEndpoint('9qiAuWa5ryYeTj1gLy9BGiiVkfgkXnsN25wkYQSfyaws')
  },
  NETWORK_ARBITRUM: {
    id: 42161,
    name: 'arbitrum',
    subgraph: sdk.graph.modifyEndpoint('5Qz4mWABKaCfr9uGnteAAwmWmBAyQtRDYgB3ydU556HX')
  }
}
