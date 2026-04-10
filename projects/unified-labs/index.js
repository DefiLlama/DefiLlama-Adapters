const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in vaults curated by Unified Labs.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
      ],
    },
    polygon: {
      morphoVaultOwners: [
        '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
      ],
    },
    monad: {
      morphoVaultOwners: [
        '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
      ],
    },
  },
}
module.exports = getCuratorExport(configs)
