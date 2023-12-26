const { compoundV3Exports } = require('../helper/compoundV3')

module.exports = compoundV3Exports({
  ethereum: {
    markets: [
      '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // USDC Market
      '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // ETH Market
    ],
  },
  arbitrum: {
    markets: [
      '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
      '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf'
    ],
  },
  polygon: {
    markets: ['0xF25212E676D1F7F89Cd72fFEe66158f541246445'],
  },
  base: {
    markets: [
      '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // USDbC Market
      '0x46e6b214b524310239732D51387075E0e70970bf', // ETH Market
    ],
  }
})
