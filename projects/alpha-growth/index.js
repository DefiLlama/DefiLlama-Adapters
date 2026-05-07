const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology:
    "Count all assets are deposited in all vaults curated by AlphaGrowth.",
  blockchains: {
    base: {
      eulerVaultOwners: ["0x44102929B2248b1cefe2E65e9D580893B6D6823A"],
    },
    unichain: {
      eulerVaultOwners: ["0x8d9fF30f8ecBA197fE9492A0fD92310D75d352B9"],
    },
  },
};

module.exports = getCuratorExport(configs);
