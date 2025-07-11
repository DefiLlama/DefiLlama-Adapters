const { generateSingleVaultExport } = require('../helper/atv-helper');

module.exports = generateSingleVaultExport({
  methodology: 'TVL is calculated using storage contract query via calculatePoolInUsd function for the âtv802 vault deployed on Ethereum.',
  vaultAddress: "0xb68e430c56ed9e548e864a68a60f9d41f993b32c",
  storageContract: "0x6a38305d86a032db1b677c975e6fe5863cf1edd2", // TO BE FILLED BY USER
  vaultType: "âtv802",
  fallbackTokens: [], // ATV-802 uses dynamic token discovery, no hardcoded tokens
  doublecounted: false,
  chain: 'ethereum'
});
