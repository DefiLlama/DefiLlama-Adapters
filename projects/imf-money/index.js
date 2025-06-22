const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by the IMF.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x2625bfb6ad9840c2c0abb48f150eb9158393c466',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
