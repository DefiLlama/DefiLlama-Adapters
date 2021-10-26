const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');

function getChainTvl(graphUrls, factoriesName = "uniswapFactories", tvlName = "totalLiquidityUSD") {
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
            const uniswapFactories = (await request(
                graphUrls[chain],
                graphQuery,
                {
                    block,
                }
            ))[factoriesName];
            const usdTvl = Number(uniswapFactories[0][tvlName])

            return toUSDTBalances(usdTvl)
        }
    }
}

function getAvaxUniswapTvl(graphUrl, factoriesName = "uniswapFactories", tvlName = "totalLiquidityETH") {
    const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;
    return async (timestamp, ethBlock, chainBlocks) => {
        const response = await request(
            graphUrl,
            graphQuery,
            {
              block:chainBlocks.avax,
            }
          );
        
          return {
            'avalanche-2': Number(response[factoriesName][0].totalLiquidityETH)
          }
    }
}

module.exports = {
    getChainTvl,
    getAvaxUniswapTvl
}