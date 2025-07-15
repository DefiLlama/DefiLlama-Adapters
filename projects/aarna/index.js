const { generateAtvExport } = require('../helper/atv-helper');

  // Storage contracts for direct TVL calculation (TO BE FILLED BY USER)
  storageContracts: {
    ethereum: {
      'ATV-802': "0x6a38305d86a032db1b677c975e6fe5863cf1edd2",
      'ATV-808': "0xE3cb06cB58E84F96AEde7D2d703F0B969bB69A81", 
      'ATV-111': "0xceb202d3075be4abd24865fd8f307374923948ad"
    },
    arbitrum: {
      'ATV-111': "0x4700bd9cc7232f243945b4a55834ab84563e4e9d"
    },
    sonic: {
      'ATV-111': "0x13da4847c80732cab3341f459a094e042af98691"
    }
  },

  // Chain-specific fallback tokens (only for ATV-111, ATV-802/808 use dynamic discovery)
  fallbackTokens: {
    ethereum: [
      "0x39aa39c021dfbae8fac545936693ac917d5e7563", // cUSDC
      "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // cUSDCv3  
      "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", // aETHUSDC
    ],
    arbitrum: [
      "0x625E7708f30cA75bfd92586e17077590C60eb4cD", // aave arb usdc
      "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", // compound v3 arb usdc
      "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Arbitrum
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e on Arbitrum
    ],
    sonic: [
      "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // usdc address on sonic
      "0x3F5EA53d1160177445B1898afbB16da111182418", // pendle lp token on sonic
    ]
  },

  // Multi-chain deployment
  chains: ['ethereum', 'arbitrum', 'sonic']
};

// Export the generated configuration
module.exports = generateAtvExport(AARNA_CONFIG);
