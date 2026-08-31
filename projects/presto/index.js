const { getCuratorExport } = require('../helper/curators')

module.exports = getCuratorExport({
  methodology: 'Counts all assets deposited in Morpho vaults curated by Presto.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x21d7f2430E33054151AC3963aCBD4813e78cB3C9', // initial owner — Presto USDC Prime
        '0xb41437827266a20aB30bf457A81561f7b5e1bE6D', // initial owner — Presto USDC Forte
      ],
    },
  },
})
