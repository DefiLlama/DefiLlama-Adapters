const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  velas: {
    tvl: getUniTVL({
      factory: '0xe82d721A6CdeC2f86e9Fca074Ff671c8621F8459', chain: 'velas', useDefaultCoreAssets: true,
    })
  },
};
