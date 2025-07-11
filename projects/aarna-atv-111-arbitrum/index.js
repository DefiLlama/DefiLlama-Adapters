const { generateSingleVaultExport } = require('../helper/atv-helper');

module.exports = generateSingleVaultExport({
  methodology: 'TVL is calculated using storage contract query via calculatePoolInUsd function for the âtv111 vault deployed on Arbitrum.',
  vaultAddress: "0xe1a6bda42fbafae38607598386a1050613c1a64b",
  storageContract: "0x4700bd9cc7232f243945b4a55834ab84563e4e9d", // TO BE FILLED BY USER
  vaultType: "âtv111",
  fallbackTokens: [
    "0x625E7708f30cA75bfd92586e17077590C60eb4cD", // aave arb usdc
    "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", // compound v3 arb usdc
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Arbitrum
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e on Arbitrum
  ],
  doublecounted: false,
  chain: 'arbitrum'
});
