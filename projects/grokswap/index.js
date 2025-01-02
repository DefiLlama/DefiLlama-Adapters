const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0x01D434704aFf3edDb37eFB49f4bFE697e67b3BD0",
    }),
  },
};
