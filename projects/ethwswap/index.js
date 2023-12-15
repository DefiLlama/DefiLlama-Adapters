const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x78376072F4945b2A5450B1A6B41a85ff20034527',
    })
  }
};