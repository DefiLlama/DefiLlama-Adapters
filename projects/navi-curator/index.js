const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in Lagoon vaults curated by NAVI Protocol, using each vault\'s totalAssets().',
  blockchains: {
    ethereum: {
      erc4626: [
        '0x47491305479635357df29fe0cb6f1af10e51d4da', // Lagoon: USDC High Yield (nUSDC)
      ],
    },
  },
}

module.exports = getCuratorExport(configs)
