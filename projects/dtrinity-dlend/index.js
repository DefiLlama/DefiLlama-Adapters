const { aaveExports, methodology } = require('../helper/aave')

module.exports = {
  fraxtal: aaveExports(null, undefined, undefined, [
    '0xFB3adf4c845fD6352D24F3F0981eb7954401829c',
  ], {
    v3: true,
    blacklistedTokens: [
      // Exclude protocol-native synthetic debt assets from supplied-asset TVL.
      '0x788D96f655735f52c676A133f4dFC53cEC614d4A', // dUSD
    ],
  }),
  sonic: aaveExports(null, undefined, undefined, [
    '0xB245F8321E7A4938DEf8bDb2D5E2E16481268c42',
  ], {
    v3: true,
    blacklistedTokens: [
      // Exclude protocol-native synthetic debt assets from supplied-asset TVL.
      '0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975', // dUSD
      '0x614914B028A7D1fD4Fab1E5a53a3E2dF000bcB0e', // dS
    ],
  }),
  ethereum: aaveExports(null, undefined, undefined, [
    // AaveProtocolDataProvider on Ethereum mainnet, resolved from PoolAddressesProvider.getPoolDataProvider().
    '0x7BC6d94344392ac7898Ce197Ae382e21c71347f2',
  ], {
    v3: true,
    blacklistedTokens: [
      // Exclude protocol-native synthetic debt assets from supplied-asset TVL.
      '0x07fFf99e1664d9B116fbC158c0E99785F81cA236', // dUSD
      '0xb419ecdd222981e7e54cec316797ecb799c6afdc', // dETH
    ],
  }),
  methodology,
}
