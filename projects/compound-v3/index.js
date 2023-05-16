const ADDRESSES = require('../helper/coreAssets.json')
const { compoundV3Exports } = require('../helper/compoundV3')
const markets = [
  "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // USDC Market
  '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // ETH Market
]

module.exports = compoundV3Exports({
  ethereum: {
    markets,
  },
  arbitrum: {
    markets: ['0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA'],
  },
  polygon: {
    markets:["0xF25212E676D1F7F89Cd72fFEe66158f541246445"],
  }
})