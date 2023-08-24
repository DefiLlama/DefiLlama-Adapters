const { cachedGraphQuery } = require('./helper/cache')

const graphUrl = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';

async function tvl(timestamp, block, _, { api }) {
   const { pools } = await cachedGraphQuery('defiplaza', graphUrl, '{  pools {    id    tokens {      id    }  }}');
   const ownerTokens = pools.map(pool => [pool.tokens.map(token => token.id), pool.id]);
   return api.sumTokens({ ownerTokens})
}

module.exports = {
   ethereum: {
      tvl,
   },
};
