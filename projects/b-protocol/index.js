const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by B protocol.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xf7D44D5a28d5AF27a7F9c8fc6eFe0129e554d7c4',
        '0x2566f66f68ed438726AD904524FB306A03FdB80B',
        '0x17e7bB9fe7983947FdCf02c1E3d8e6C92C21da54',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0x17e7bB9fe7983947FdCf02c1E3d8e6C92C21da54',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
