const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by TelosC.',
  blockchains: {
    plasma: {
      eulerVaultOwners: [
        '0x7054b25D47b9342dA3517AD41A4BD083De8D3f70',
        '0x7d07BFdd01422D7b655B333157eB551B9712dCd8',
      ],
    },
    ethereum: {
      eulerVaultOwners: [
        '0x7054b25D47b9342dA3517AD41A4BD083De8D3f70',
        '0x7d07BFdd01422D7b655B333157eB551B9712dCd8',
      ],
    }
  }
}

module.exports = getCuratorExport(configs)
