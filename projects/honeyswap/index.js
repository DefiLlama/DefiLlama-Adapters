const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const chainTvl = getChainTvl({
  xdai: 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai',
  polygon: 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-polygon'
}, "honeyswapFactories")

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: chainTvl('xdai')
  },
  polygon: {
    tvl: chainTvl('polygon')
  },
  tvl: sdk.util.sumChainTvls([chainTvl('xdai'), chainTvl('polygon')])
}