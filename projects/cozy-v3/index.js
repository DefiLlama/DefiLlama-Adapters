const { getCuratorExport } = require("../helper/curators");

module.exports = getCuratorExport({
  methodology: "Count all assets deposited in Euler vaults curated by Cozy.",
  blockchains: {
    ethereum: {
      eulerVaultOwners: ["0xd7E606CB833fEdB224CA2360477C7519898d187B"],
    },
  },
});
