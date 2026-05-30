const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Cassa.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x34a0d3333FF6028b5Fad62879A9d24d3C071E343',
        '0xeeF44faf5fE0cc1FAB04Bb052Bff750Cf37A7fC4',
      ],
    },
  },
}

module.exports = {
  ...getCuratorExport(configs),
}
