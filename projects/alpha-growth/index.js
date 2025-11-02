const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by AlphaGrowth.',
  blockchains: {
    unichain: {
      eulerVaultOwners: [
        '0x8d9fF30f8ecBA197fE9492A0fD92310D75d352B9',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
