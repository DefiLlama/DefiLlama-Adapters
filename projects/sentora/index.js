const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Sentora.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x5aB5FE7d04CFDeFb9daf61f6f569a58A53D05eE1',
        '0xe78C246ea973389F55BAEADF71e04750D50417d1'
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
