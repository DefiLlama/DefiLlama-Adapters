const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Varlamore Capital.',
  blockchains: {
    ethereum: {
      siloVaultOwners: [
        '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
      ],
    },
    arbitrum: {
      siloVaultOwners: [
        '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
      ],
    },
    sonic: {
      siloVaultOwners: [
        '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
      ],
    },
    avax: {
      siloVaultOwners: [
        '0xd8454B3787c6Aab1cf2846AF7882f8c440C3903d',
      ]
    }
  }
}

module.exports = getCuratorExport(configs)
