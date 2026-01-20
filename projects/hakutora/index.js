const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Hakutora.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x76c303fA012109eCBb34E4bAf1789c3e9FbEb3A4',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
