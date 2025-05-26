const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Tulip Capital.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x59e608E4842162480591032f3c8b0aE55C98d104',
      ],
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
    },
    berachain: {
      eulerVaultOwners: [
        '0x18d23B961b11079EcD499c0EAD8E4F347e4d3A66',
      ],
    },
    bob: {
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
