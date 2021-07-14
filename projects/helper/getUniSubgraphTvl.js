const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk')

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
            let block;
            if (chain === "ethereum") {
                block = ethBlock;
            }
            block = chainBlocks[chain]
            if (block === undefined) {
                block = (await sdk.api.util.lookupBlock(timestamp, { chain })).block
            }
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

module.exports = {
    getChainTvl
}