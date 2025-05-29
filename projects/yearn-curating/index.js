const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Yearn.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xe5e2Baf96198c56380dDD5E992D7d1ADa0e989c0',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0xFEaE2F855250c36A77b8C68dB07C4dD9711fE36F',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
