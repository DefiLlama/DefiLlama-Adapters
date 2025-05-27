const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Hyperithm.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x16fa314141C76D4a0675f5e8e3CCBE4E0fA22C7c',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
