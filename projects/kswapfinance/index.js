const { getUniTVL } = require('../helper/unknownTokens')

const factory = "0x60DCD4a2406Be12dbe3Bb2AaDa12cFb762A418c1";

module.exports = {
  okexchain: { tvl: getUniTVL({ factory, useDefaultCoreAssets: true }), },
  methodology:
    "We count tvl on LiquidityPool(pairs) through factory contract",
};
