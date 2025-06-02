const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  velas: {
    tvl: getUniTVL({
      factory: '0xe82d721A6CdeC2f86e9Fca074Ff671c8621F8459', useDefaultCoreAssets: true,
      blacklist: ['0xcd7509b76281223f5b7d3ad5d47f8d7aa5c2b9bf', '0xd12f7a98c0d740e7ec82e8caf94eb79c56d1b623',],
    })
  },
};
