// Equity - Central Vaults
const { gmxExports } = require("../helper/gmx");

module.exports = {
  fantom: {
    tvl: gmxExports({ vault: '0x9e4105f9e2284532474f69e65680e440f4c91cb8' }), // Vault 01
  },
};
