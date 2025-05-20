const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Fence.',
  blockchains: {
    ethereum: {
      morpho: [
        '0xC21DB71648B18C5B9E038d88393C9b254cf8eaC8',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
