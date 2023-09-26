const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x973c934137dd687eca67bdd1c5a8b74286964ac6', }),
  },
  heco: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xc32cccf795940ca8491cd4f31161509db28ab719', }),
  },
  bsc: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xdf97982bf70be91df4acd3d511c551f06a0d19ec', }),
  },
  avax:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x5c02e78a3969d0e64aa2cfa765acc1d671914ac0', }),
  },
}