const { getCuratorExport } = require("../helper/curators");

const configs = {
  blockchains: {
    sei: {
      morphoVaultOwners: [
        // '0xf7F66970Cf68Cad32D321A37F6FF55Ad27d0b83D',
        '0xe55C09E30076a580722Aeb265632ebF936D02F57',
      ],
    },
    celo: {
      morphoVaultOwners: [
        '0x81c76F62f7E05DEC75800150bA5A23f62e2f091F',
      ],
    },
  }
}


module.exports = getCuratorExport(configs)

module.exports.methodology = 'Counts all assets that are deposited in all vaults curated by Feather.'