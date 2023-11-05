const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { blockQuery, getBlock, } = require('../helper/http')

const endpoints = {
  "era": "https://api.studio.thegraph.com/query/49147/derpdex-v3-amm/v0.0.10",
  "base": "https://api.thegraph.com/subgraphs/name/geckocoding/derpdex-amm-base",
  "op_bnb": "https://opbnb.subgraph.derpdex.com/subgraphs/name/geckocoding/derpdex-opbnb"
};

const tvl = getChainTvl(endpoints)

function getChainTvl(graphUrls, factoriesName = "factories", tvlName = "totalValueLockedUSD", blockCatchupLimit = 500) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;
  return (chain) => {
    return async (_, _b, _cb, { api }) => {
      await api.getBlock()
      const block = api.block
      let uniswapFactories

      if (!blockCatchupLimit) {
        uniswapFactories = (await request(graphUrls[chain], graphQuery, { block, }))[factoriesName];
      } else {
        uniswapFactories = (await blockQuery(graphUrls[chain], graphQuery, { api, blockCatchupLimit, }))[factoriesName];
      }

      const usdTvl = Number(uniswapFactories[0][tvlName])
      return toUSDTBalances(usdTvl)
    }
  }
}

Object.keys(endpoints).forEach(chain => {
  module.exports[chain] = {
    tvl: tvl(chain),
    misrepresentedTokens: true
  }
})
