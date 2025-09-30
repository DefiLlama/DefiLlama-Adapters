const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by TelosC.',
  blockchains: {
    plasma: {
      eulerVaultOwners: [
        '0x7054b25D47b9342dA3517AD41A4BD083De8D3f70',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
