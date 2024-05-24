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
      '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // USDC.e Market
      '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // USDC Market
    ],
  },
  polygon: {
    markets: ['0xF25212E676D1F7F89Cd72fFEe66158f541246445'], // USDC.e Market
  },
  base: {
    markets: [
      '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // USDbC Market
      '0x46e6b214b524310239732D51387075E0e70970bf', // ETH Market
      '0xb125E6687d4313864e53df431d5425969c15Eb2F', // USDC Market
    ],
  },
  scroll: {
    markets: ['0xB2f97c1Bd3bf02f5e74d13f02E3e26F93D77CE44'], // USDC Market
  },
  optimism: {
    markets: ['0x2e44e174f7D53F0212823acC11C01A11d58c5bCB'], // USDC Matket
  }
})
