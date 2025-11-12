const ADDRESSES = require('../helper/coreAssets.json')
const { generateAtvExport } = require('../helper/atv-helper');

// Configuration for all Aarna ATV vaults across chains
const AARNA_CONFIG = {
  methodology: 'TVL is calculated using direct on-chain storage contract queries via calculatePoolInUsd function for each âtv vault. This includes âtv802 (quant AI), âtv808 (asymmetric alpha), and âtv111 (multi layer yield) vaults deployed across Ethereum, Arbitrum, and Sonic chains.',
  
  // Vault addresses by chain and type
  vaults: {
    ethereum: {
      'ATV-802': "0xb68e430c56ed9e548e864a68a60f9d41f993b32c",
      'ATV-808': "0x60697825812ecC1Fff07f41E2d3f5cf314674Fa6", 
      'ATV-111': "0x72ec8447074dc0bfbedfb516cc250b525f3a4aba"
    },
    arbitrum: {
      'ATV-111': "0xe1a6bda42fbafae38607598386a1050613c1a64b"
    },
    sonic: {
      'ATV-111': "0x1cb934e1f5acdb5b805c609a2c5a09aa8489f124"
    }
  },

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
      ADDRESSES.arbitrum.USDC_CIRCLE, // USDC on Arbitrum
      ADDRESSES.arbitrum.USDC, // USDC.e on Arbitrum
    ],
    sonic: [
      ADDRESSES.sonic.USDC_e, // usdc address on sonic
      "0x3F5EA53d1160177445B1898afbB16da111182418", // pendle lp token on sonic
    ]
  },

  // Multi-chain deployment
  chains: ['ethereum', 'arbitrum', 'sonic']
};

// Export the generated configuration
module.exports = generateAtvExport(AARNA_CONFIG);
