const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Llama Risk.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x0FB44352bcfe4c5A53a64Dd0faD9a41184A1D609',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
