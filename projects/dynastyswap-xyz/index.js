const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  pulse: {
    tvl: getUniTVL({ factory: '0x7abcEc2e35505aF1720431A6c414067717342B1F', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
}; // node test.js projects/pulsex/index.js