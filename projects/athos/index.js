
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  misrepresentedTokens: true,
  moonbeam: {
    tvl: () => ({}),
    staking: sumTokensExport({
      chain: 'moonbeam',
      owner: '0x2dfdb2e340eadb2e29117a2b31c139fe81c550a9',
      tokens: ['0xcbabee0658725b5b21e1512244734a5d5c6b51d6',],
    }),
  },
};
