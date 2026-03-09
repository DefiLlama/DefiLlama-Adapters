const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in Greenhouse curated vaults.',
  blockchains: {
    arbitrum: {
      siloVaultOwners: [
        '0x1B35727072435BB97FBe8cC378eb6973c98FaAb3',
      ],
    },
    sonic: {
      siloVaultOwners: [
        '0x1B35727072435BB97FBe8cC378eb6973c98FaAb3',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
