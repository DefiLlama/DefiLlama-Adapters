const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache')

const configV1 = {
  polygon: {
    startBlock: 29520285,
    blockDelay: 30,
    theGraph: {
      endpoint: 'https://api.thegraph.com/subgraphs/name/swaap-labs/swaapv1',
      query: `pools: pools(orderBy: liquidity, orderDirection: desc) {
        id
        tokens {
          address
        }
      }`
    }
  }
}

function tvlFunctionGetterV1(chain) {
  return async function tvlFunction(timestamp, ethBlock, chainBlocks, { api }) {
    let block = chainBlocks[chain]
    if (block)
      block = configV1[chain]['startBlock'] + configV1[chain]['blockDelay'] > chainBlocks[chain]['startBlock'] ?
        configV1[chain]['startBlock'] : chainBlocks[chain] - configV1[chain]['blockDelay'] // delayed to allow subgraph to update

    const fetchAllPools = `query ($block: Int) { ${configV1[chain]['theGraph']['query']} }`;
    const results = await cachedGraphQuery('swaaap-v1/' + chain, configV1[chain]['theGraph']['endpoint'], fetchAllPools, {
      variables: { block, }
    });

    const toa = results.pools.map(i => i.tokens.map(j => ([j.address, i.id]))).flat()
    return sumTokens2({ api, tokensAndOwners: toa, })
  }
}

module.exports = {
  start: 1655130642, // Jun-13-2022 02:30:42 PM +UTC
  methodology: `The TVL is retrieved using a mix of TheGraph (to get the list of pools) and on-chain (to get the pools' assets balance) calls.`,
  polygon: {
    tvl: tvlFunctionGetterV1("polygon"),
  },
};
