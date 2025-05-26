const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Alterscope.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x0d8249DD621fB1c386A7A7A949504035Dd3436A3',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
