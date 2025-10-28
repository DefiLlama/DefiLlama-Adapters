const { getCuratorExport } = require("../helper/curators");

const configs = {
  blockchains: {
    sei: {
      morphoVaultOwners: [
        // '0xf7F66970Cf68Cad32D321A37F6FF55Ad27d0b83D',
        '0xe55C09E30076a580722Aeb265632ebF936D02F57',
      ],
    },
  }
}


module.exports = getCuratorExport(configs)

module.exports.methodology = 'Counts all assets that are deposited in all vaults curated by Feather.'