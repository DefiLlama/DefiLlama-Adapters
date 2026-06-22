const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Armitage.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x5dc53a23AdC9f2Bed98de6F59F7F309a7c71FF2B',
        '0xA2EAaD0D586cF9FD73bb2c09cF6A7E3e187D68cd',
      ],
    },
  },
};

module.exports = getCuratorExport(configs);
