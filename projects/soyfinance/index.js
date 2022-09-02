const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  callisto: {
    tvl: getUniTVL({
      factory: '0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5',
      chain: 'callisto',
      useDefaultCoreAssets: true,
    })
  }
};