const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Hyperithm.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x777791C4d6DC2CE140D00D2828a7C93503c67777',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
