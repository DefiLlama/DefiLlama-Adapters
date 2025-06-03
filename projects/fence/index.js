const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Fence.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xF92971B4D9e6257CF562400ed81d2986F28a8c26',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
