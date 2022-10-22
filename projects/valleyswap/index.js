const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  timetravel: true,
  start: 411656,
  oasis: {
    tvl: getUniTVL({
      factory: '0xa25464822b505968eEc9A45C43765228c701d35f',
      chain: 'oasis',
      useDefaultCoreAssets: true,
    }),
  },
  misrepresentedTokens: true,
};
