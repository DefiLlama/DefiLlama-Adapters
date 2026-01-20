const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by M11C.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x71807287926c5195D92D2872e73FC212C150C112',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
