const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { blockQuery, getBlock, } = require('./http')

function getChainTvl(graphUrls, factoriesName = "uniswapFactories", tvlName = "totalLiquidityUSD", blockCatchupLimit = 500) {
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
    return async (api) => {
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

module.exports = {
  getChainTvl,
}