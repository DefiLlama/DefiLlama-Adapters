const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Keyring Network.',
  blockchains: {
    avax: {
      eulerVaultOwners: [
        '0x0B50beaE6aac0425e31d5a29080F2A7Dec22754a',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
