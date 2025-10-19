const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Avantgarde.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xb263237E30fe9be53d6F401FCC50dF125D60F01a',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
