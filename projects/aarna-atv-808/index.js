const { generateSingleVaultExport } = require('../helper/atv-helper');

module.exports = generateSingleVaultExport({
  methodology: 'TVL is calculated using storage contract query via calculatePoolInUsd function for the âtv808 vault deployed on Ethereum.',
  vaultAddress: "0x60697825812ecC1Fff07f41E2d3f5cf314674Fa6",
  storageContract: "0xE3cb06cB58E84F96AEde7D2d703F0B969bB69A81", // TO BE FILLED BY USER
  vaultType: "âtv808",
  fallbackTokens: [], // ATV-808 uses dynamic token discovery, no hardcoded tokens
  doublecounted: false,
  chain: 'ethereum'
});
