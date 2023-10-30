const { sumERC4626VaultsExport } = require("../helper/erc4626");

const vaultsMantle = [
  "0xfa944c1996efBF9FbFF1a378903F4AD82C172D72",
  "0x945438ef559EFf400429DFb101e57a6299B5ceE2",
  "0xA25d1843eedE1E1D0631b979da605606412e64f7",
  "0xAa81F912D09Fd313Bbc1d5638632aB6bf59aB495",
  "0x0DB2BA00bCcf4F5e20b950bF954CAdF768D158Aa",
  "0x713C1300f82009162cC908dC9D82304A51F05A3E",
  "0xDc63179CC57783493DD8a4Ffd7367DF489Ae93BF",
  "0x5f247B216E46fD86A09dfAB377d9DBe62E9dECDA",
];

const vaultsManta = [
  "0x713C1300f82009162cC908dC9D82304A51F05A3E",
  "0x0DB2BA00bCcf4F5e20b950bF954CAdF768D158Aa",
  "0xDc63179CC57783493DD8a4Ffd7367DF489Ae93BF",
  "0x5f247B216E46fD86A09dfAB377d9DBe62E9dECDA",
];

module.exports = {
  doublecounted: true,  
  mantle: {
    tvl: sumERC4626VaultsExport({
      vaults: vaultsMantle,
    }),
  },
  manta: {
    tvl: sumERC4626VaultsExport({
      vaults: vaultsManta,
    }),
  },
};
