const { generateAtvExport } = require('../helper/atv-helper');

// Configuration for all Aarna ATV products
const AARNA_CONFIG = {
  methodology: `TVL is calculated using direct on-chain storage contract queries via calculatePoolInUsd function for all Aarna ATV vault contracts across multiple chains. This includes multi-chain deployments on Ethereum, Arbitrum, and Sonic, with individual vault breakdowns (ATV-802, ATV-808, ATV-111) and total protocol TVL. Falls back to token balance calculation using dynamic token discovery for ATV-802/808 and dynamic+hardcoded tokens for ATV-111 vaults when storage contracts are not configured.`,
  
  doublecounted: false,
  
  // Multi-chain vault configurations
  vaults: {
    ethereum: {
      'ATV-802': {
        address: "0xb68e430c56ed9e548e864a68a60f9d41f993b32c",
        name: "ATV-802 Conservative Strategy",
        description: "Conservative yield farming strategy with lower risk profile"
      },
      'ATV-808': {
        address: "0x60697825812ecC1Fff07f41E2d3f5cf314674Fa6", 
        name: "ATV-808 Balanced Strategy", 
        description: "Balanced yield strategy with moderate risk/reward"
      },
      'ATV-111': {
        address: "0x72ec8447074dc0bfbedfb516cc250b525f3a4aba",
        name: "ATV-111 Aggressive Strategy",
        description: "Aggressive yield strategy with higher potential returns"
      }
    },
    arbitrum: {
      'ATV-111': {
        address: "0xe1a6bda42fbafae38607598386a1050613c1a64b",
        name: "ATV-111 Arbitrum Aggressive Strategy",
        description: "Aggressive yield strategy deployed on Arbitrum for L2 efficiency"
      }
    },
    sonic: {
      'ATV-111': {
        address: "0x1cb934e1f5acdb5b805c609a2c5a09aa8489f124",
        name: "ATV-111 Sonic Aggressive Strategy", 
        description: "Aggressive yield strategy deployed on Sonic blockchain"
      }
    }
  },

  // Storage contracts for direct TVL calculation (TO BE FILLED BY USER)
  storageContracts: {
    ethereum: {
      'ATV-802': "STORAGE_ADDRESS_TO_BE_FILLED",
      'ATV-808': "STORAGE_ADDRESS_TO_BE_FILLED", 
      'ATV-111': "STORAGE_ADDRESS_TO_BE_FILLED"
    },
    arbitrum: {
      'ATV-111': "STORAGE_ADDRESS_TO_BE_FILLED"
    },
    sonic: {
      'ATV-111': "STORAGE_ADDRESS_TO_BE_FILLED"
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
