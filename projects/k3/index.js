const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by K3 Capital.',
  blockchains: {
    ethereum: {
      symbiotic: [
        '0xdC47953c816531a8CA9E1D461AB53687d48EEA26',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0x5Bb012482Fa43c44a29168C6393657130FDF0506',
        '0x2E28c94eE56Ac6d82600070300d86b3a14D5d71A',
      ],
    },
    avax: {
      eulerVaultOwners: [
        '0xa4dC6C20475fDD05b248fbE51F572bD3154dd03B',
      ],
    },
    bob: {
      eulerVaultOwners: [
        '0xDb81B93068B886172988A1A4Dd5A1523958a23f0',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0xe34A3fb26B3121F4E68bE89Ea553BaC2149F975d',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
