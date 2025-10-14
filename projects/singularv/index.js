const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by singularV.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x46057881E0B9d190920FB823F840B837f65745d5',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
