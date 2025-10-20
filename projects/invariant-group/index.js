const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Invariant Group.',
  blockchains: {
    ethereum: {
      erc4626: [
        '0xc155444481854c60e7a29f4150373f479988f32d',
      ],
    },
    plasma: {
      erc4626: [
        '0x76309a9a56309104518847bba321c261b7b4a43f',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
