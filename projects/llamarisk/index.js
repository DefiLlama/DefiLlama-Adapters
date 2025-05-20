const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Llama Risk.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x67315dd969B8Cd3a3520C245837Bf71f54579C75',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
