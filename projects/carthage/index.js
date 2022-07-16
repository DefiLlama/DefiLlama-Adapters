const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: "Factory address (0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  candle: {
    tvl: getUniTVL({
      chain: 'candle',
      factory: '0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95',
      coreAssets: ['0x85FA00f55492B0437b3925381fAaf0E024747627'],
    })
  }
};
