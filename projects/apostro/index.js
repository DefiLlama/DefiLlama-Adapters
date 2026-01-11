const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Apostro.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x3B8DfE237895f737271371F339eEcbd66Face43e',
        '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
      ],
      eulerVaultOwners: [
        '0x3B8DfE237895f737271371F339eEcbd66Face43e',
        '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0x3B8DfE237895f737271371F339eEcbd66Face43e',
        '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
      ],
      eulerVaultOwners: [
        '0x3B8DfE237895f737271371F339eEcbd66Face43e',
        '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
      ],
    },
    bsc: {
      eulerVaultOwners: [
        '0x3B8DfE237895f737271371F339eEcbd66Face43e',
        '0xf726311F85D45a7fECfFbC94bD8508a0A39958c6',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
