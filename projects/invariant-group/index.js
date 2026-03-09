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
    hemi: {
      erc4626: [
        '0x614eb485de3c6c49701b40806ac1b985ad6f0a2f', '0xD172B64AA13d892bb5EB35f3482058eAE0BC5B2a',
      ]
    }
  }
};

module.exports = getCuratorExport(configs)
