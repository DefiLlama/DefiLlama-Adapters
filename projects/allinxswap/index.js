const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  op_bnb: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0xAFcA85A70Bd1C2Bf98DB7F24b2380134F76Af7f1",
    }),
  },
  bsc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0xB755953681f0b54f59336294f6758aE9e2E3aB5e",
    }),
  },
};
