// SynFutures-v1 TVL from chain
const { request, gql } = require("graphql-request");
const { sumTokens2 } = require('../helper/unwrapLPs')

const QUERY_PAIRS = gql`{
  pairs(first: 1000, where: {state_: {status_not_in: [CREATED]}}) {
    id
    symbol
    ammProxy
    futuresProxy
    quote {
      id
      symbol
      decimals
    }
    state{
      status
    }
  }
}`;

const info = {
  ethereum: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/ethereum-v1',
  },
  bsc: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/bsc-v1',
  },
  polygon: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/polygon-v1',
  },
  arbitrum: {
    subgraph: 'https://api.thegraph.com/subgraphs/name/synfutures/arbitrum-one-v1',
  },
}

function chainTvl(chain) {
  return async (_, _b, {[chain]: block}) => {
    const pairsData = await request(info[chain].subgraph,QUERY_PAIRS,{ block });
    const toa = []

    for (let pair of pairsData.pairs)
      toa.push([pair.quote.id, pair.id])
    return sumTokens2({ chain, block, tokensAndOwners: toa, })
  }
}

module.exports = {
  timetravel: false,
  polygon: {
    tvl: chainTvl('polygon'),
  },
  bsc: {
    tvl: chainTvl('bsc'),
  },  
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
}