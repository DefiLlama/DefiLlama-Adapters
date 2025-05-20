const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Ouroboros Capital.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x2F21c6499fa53a680120e654a27640Fc8Aa40BeD',
      ],
      euler: [
        '0x75f66ed34c274eaD52CFA25De9388E98e12Edb33',
        '0xE27A96f4c9528e3d32E6f31c6aCa9281EbEA0338',
        '0x738bC1e2F68F5ec58ea456fb4269B4b3f51714b5',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
