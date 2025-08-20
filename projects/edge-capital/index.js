const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Edge Capital.',
  blockchains: {
    tac:{
      eulerVaultOwners: [
        '0xB2b9a27a6160Bf9ffbD1a8d245f5de75541b1DDD',
        '0x1280e86Cd7787FfA55d37759C0342F8CD3c7594a',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
