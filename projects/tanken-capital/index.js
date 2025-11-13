const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by Tanken Capital.',
  blockchains: {
    base: {
      erc4626: [
        '0xebc6c7883ca32ef9484740ba32a816f5f88b7a41', // Tanken Capital vault (IPOR Fusion, Morpho, Euler)
      ],
    },
    ethereum: {
      erc4626: [
        '0xca7c196f00e04A5e1c71B91476d0d58f82499734', // Tanken USDC vault (Morpho Blue)
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
