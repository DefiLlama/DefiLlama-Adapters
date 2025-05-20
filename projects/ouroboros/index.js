const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Ouroboros Capital.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x2F21c6499fa53a680120e654a27640Fc8Aa40BeD',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
