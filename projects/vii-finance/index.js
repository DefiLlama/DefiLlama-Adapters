const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by VII Finance.',
  blockchains: {
    unichain: {
      eulerVaultOwners: [
        '0x12e74f3C61F6b4d17a9c3Fdb3F42e8f18a8bB394',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)