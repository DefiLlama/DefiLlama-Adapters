const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in vaults curated by Unified Labs.',
  blockchains: {
    monad: {
      morphoVaultOwners: [
        '0x75B3C335B85C931B1eE7BEeB3c0e40429F002373',
      ],
      morpho: [
        '0x35E4f3111B37135B1A8EBd72d8cBC9624AeE863a',
        '0x0ED3615ff949C8A34D15441970900E849A3409FC',
      ],
    },
  },
}
module.exports = getCuratorExport(configs)
