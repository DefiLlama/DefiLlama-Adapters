// SynFutures-v1 TVL from chain
const { request, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')

const QUERY_UNDERLYINGS = gql`{
  underlyings{
    id
    symbol
    quote{
      id
    }
  }
}`;

const info = {
  polygon: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/v2-polygon',
  }
}

function chainTvl(chain) {
  return async (_, _b, {[chain]: block}) => {
    const data = await request(info[chain].subgraph,QUERY_UNDERLYINGS,{ block });
    const toa = []

    for (let underlying of data.underlyings)
      toa.push([underlying.quote.id, underlying.id])
    return sumTokens2({ chain, block, tokensAndOwners: toa, })
  }
}

module.exports = {
  timetravel: false,
  polygon: {
    tvl: chainTvl('polygon'),
  }
}