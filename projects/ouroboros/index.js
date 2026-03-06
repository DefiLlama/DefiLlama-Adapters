const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Ouroboros Capital.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x517aBc7f49DFF75b57A88b9970eF35D6e4C3BD49',
      ],
      eulerVaultOwners: [
        '0x517aBc7f49DFF75b57A88b9970eF35D6e4C3BD49',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
