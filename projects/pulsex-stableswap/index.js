const { cachedGraphQuery } = require('../helper/cache');

const graphUrl = "https://graph.pulsechain.com/subgraphs/name/pulsechain/stableswap"

module.exports = {
  pulse: {
    tvl: async (api) => {
      const res = await cachedGraphQuery('pulsex/stableswap-tvl', graphUrl, '{  pairs {    id    token0 { id }  token1 { id }  token2 { id }  }}');
      const ownerTokens = res.pairs.map((pair) => [[
        pair.token0.id,
        pair.token1.id,
        pair.token2.id
      ], pair.id]);
      return api.sumTokens({ ownerTokens });
    },
  },
};