const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Tulip Capital.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x59e608E4842162480591032f3c8b0aE55C98d104',
      ],
      eulerVaultOwners: [
        '0x7c615e12D1163fc0DdDAA01B51922587034F5C93',
      ],
      turtleclub: [
        '0x6Bf340dB729d82af1F6443A0Ea0d79647b1c3DDf',
        '0x7895a046b26cc07272b022a0c9bafc046e6f6396',
        '0x686c83Aa81ba206354fDcbc2cd282B4531365E29',
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
