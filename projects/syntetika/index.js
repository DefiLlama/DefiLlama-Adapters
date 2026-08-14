const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

const config = {
  base: { vaults: ["0x9C2dCDbDB3F0A0F628D1112bBCABD9AE75353df3"] },
};

Object.keys(config).forEach((chain) => {
  const { vaults } = config[chain];
  module.exports[chain] = { tvl: sumERC4626VaultsExport2({ vaults }) };
});

module.exports.methodology =
  "TVL is the net asset value of the Syntetika strategy vaults, read on-chain as totalAssets() - the outstanding supply of vault share tokens valued at the independently attested NAV per share - and denominated in the vault deposit asset (cbBTC).";
module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [
  ["2026-06-24", "BTC Basis+ vault deployed"],
  ["2026-07-24", "First NAV attestation published on-chain"],
];
