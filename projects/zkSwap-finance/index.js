const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x3a76e377ED58c8731F9DF3A36155942438744Ce3',
      useDefaultCoreAssets: true,
      fetchBalances: true,
    })
  },
  methodology: "TVL is total liquidity of all liquidity pools."
};
