const { getUniTVL } = require('../helper/unknownTokens');
const tvl = getUniTVL({
  useDefaultCoreAssets: true,
  factory: '0x661B92cc18a8d73209dBa1394aE56fca2F9DDb4D',
})

module.exports = {
  misrepresentedTokens: true,
  scroll: { tvl, },
  arbitrum: { tvl, },
};
