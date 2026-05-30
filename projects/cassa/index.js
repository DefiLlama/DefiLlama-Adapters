const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Cassa.',
  blockchains: {
    ethereum: {
      euler: [
        '0xBc79C4DA0452152D2C329ADE328C79705a964CEE'
      ],
    },
  },
}

module.exports = {
  ...getCuratorExport(configs),
}
