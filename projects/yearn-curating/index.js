const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Yearn.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
      ],
      turtleclub_erc4626: [
        '0x7B5A0182E400b241b317e781a4e9dEdFc1429822',
        '0xcc6a16Be713f6a714f68b0E1f4914fD3db15fBeF',
        '0x48c03B6FfD0008460F8657Db1037C7e09dEedfcb',
        '0x92C82f5F771F6A44CfA09357DD0575B81BF5F728',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
        '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
