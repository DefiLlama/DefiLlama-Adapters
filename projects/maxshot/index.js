const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by MaxShot.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ]
    },
    base: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x69C1a51711B061E5935c648beb16e349898B17dF',
      ],
    },
  }
}
module.exports = getCuratorExport(configs)
