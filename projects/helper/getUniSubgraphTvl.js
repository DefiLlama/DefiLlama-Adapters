const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');
const { blockQuery } = require('./graph')

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
    return async (timestamp, ethBlock, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks)
      let uniswapFactories

      if (!blockCatchupLimit) {
        uniswapFactories = (await request(graphUrls[chain], graphQuery, { block, }))[factoriesName];
      } else {
        uniswapFactories = (await blockQuery(graphUrls[chain], graphQuery, block, blockCatchupLimit))[factoriesName];
      }

      const usdTvl = Number(uniswapFactories[0][tvlName])
      return toUSDTBalances(usdTvl)
    }
  }
}

module.exports = {
  getChainTvl,
}