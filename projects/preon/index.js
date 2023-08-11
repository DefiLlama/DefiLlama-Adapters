const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  arbitrum: {
    ownerTokens: [
      [[ADDRESSES.null, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8'], '0xA2Ce28868A852f4B01903B5de07d4835feFe9086'],
      [['0x8ffdf2de812095b1d19cb146e4c004587c0a0692', '0x93b346b6bc2548da6a1e7d98e9a421b42541425b', ], '0x8AD15574A87e30061f24977faaA2d99bC45A3169'],
    ],
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})