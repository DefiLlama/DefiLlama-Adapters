const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Euler DAO.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0xEe009FAF00CF54C1B4387829aF7A8Dc5f0c8C8C5',
        '0x95058F3d4C69F14f6125ad4602E925845BD5d6A4',
      ],
    },
    base: {
      eulerVaultOwners: [
        '0x8359062798F09E277ABc6EB7D51652289176D2e9',
        '0x95058F3d4C69F14f6125ad4602E925845BD5d6A4',
      ],
    },
    unichain: {
      eulerVaultOwners: [
        '0x3566a8b300606516De2E4576eC4132a0E13f9f66',
      ],
    },
    swellchain: {
      eulerVaultOwners: [
        '0xC798cA555e4C7e6Fa04A23e1a727c12884F40B69',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
