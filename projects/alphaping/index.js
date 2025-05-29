const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Alphaping.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xEB4Af6fA3AFA08B10d593EC8fF87efB03BC04645',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
