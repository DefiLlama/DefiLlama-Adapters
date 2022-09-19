const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
  methodology: "tvl is the liquidity on the exchange",
  okexchain: {
    tvl: getUniTVL({
      factory: '0x7b9F0a56cA7D20A44f603C03C6f45Db95b31e539',
      chain: 'okexchain',
      useDefaultCoreAssets: true,
    })
  },
};
