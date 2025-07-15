const { generateSingleVaultExport } = require('../helper/atv-helper');

module.exports = generateSingleVaultExport({
  methodology: 'TVL is calculated using direct on-chain storage contract query via calculatePoolInUsd function for the âtv111 vault contract deployed on Sonic.',
  vaultAddress: "0x1cb934e1f5acdb5b805c609a2c5a09aa8489f124",
  storageContract: "0x13da4847c80732cab3341f459a094e042af98691",
  vaultType: "âtv111",
  fallbackTokens: [
    "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // usdc address on sonic
    "0x3F5EA53d1160177445B1898afbB16da111182418", // pendle lp token on sonic
  ],
  doublecounted: false,
  chain: 'sonic'
});
