const { generateSingleVaultExport } = require('../helper/atv-helper');

module.exports = generateSingleVaultExport({
  methodology: 'TVL is calculated using storage contract query via calculatePoolInUsd function for the âtv111 vault deployed on Ethereum.',
  vaultAddress: "0x72ec8447074dc0bfbedfb516cc250b525f3a4aba",
  storageContract: "0xceb202d3075be4abd24865fd8f307374923948ad", // TO BE FILLED BY USER
  vaultType: "âtv111",
  fallbackTokens: [
    "0x39aa39c021dfbae8fac545936693ac917d5e7563", // cUSDC
    "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // cUSDCv3
    "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", // aETHUSDC
  ],
  doublecounted: false,
  chain: 'ethereum'
});
