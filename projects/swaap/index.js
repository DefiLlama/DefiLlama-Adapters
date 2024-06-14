const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const configV1 = {
  polygon: {
    startBlock: 29520285,
    blockDelay: 30,
    theGraph: {
      endpoint: sdk.graph.modifyEndpoint('A1ibaGVUkqdLeBG7VeeSB8jm9QNmS8phSz8iooXR8puv'),
      query: `pools: pools(orderBy: liquidity, orderDirection: desc) {
        id
        tokens {
          address
        }
      }`
    }
  }
}


async function tvl(api) {
  const chain = api.chain
  const fetchAllPools = `query ($block: Int) { ${configV1[chain]['theGraph']['query']} }`;
  const results = await cachedGraphQuery('swaaap-v1/' + chain, configV1[chain]['theGraph']['endpoint'], fetchAllPools, { api });

  const toa = results.pools.map(i => i.tokens.map(j => ([j.address, i.id]))).flat()
  return sumTokens2({ api, tokensAndOwners: toa, })
}

module.exports = {
  start: 1655130642, // Jun-13-2022 02:30:42 PM +UTC
  polygon: {
    tvl,
  },
};
