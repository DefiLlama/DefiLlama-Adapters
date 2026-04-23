const { getCuratorExport } = require("../helper/curators");

module.exports = getCuratorExport({
  methodology: 'Tracks USDC in the Trinity Protocol MetaMorpho vault on Morpho Blue.',
  blockchains: {
    arbitrum: {
      morphoVaultOwners: [
        '0xA3336Bb25F231Fa25E66D2DDA3a9Aa0ed8be09DB',
      ],
    },
  },
})
