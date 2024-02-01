const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ factory: '0x23556027Ad3C3e76160AcA51e8098C395a6d815C', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  op_bnb: {
    tvl: getUniTVL({ factory: '0x43cC4516B1b549a47B493D06Fc28f6C58BC4e888', useDefaultCoreAssets: true, fetchBalances: true, })
  },
};
