const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/getBlock");
const { toUSDTBalances } = require("../helper/balances");

const graphQuery = gql`
query get_tvl($block: Int) {
    balancers(
        first: 5,
        block: { number: $block }
    ) {
        totalLiquidity,
    }
}
`;

function getBalancerSubgraphTvl(graphUrl, chain) {
    return async (timestamp, ethereumBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks)
        const { balancers } = await request(
            graphUrl,
            graphQuery,
            {
                block
            }
        );
        return toUSDTBalances(balancers[0].totalLiquidity)
    }
}

module.exports = {
    getBalancerSubgraphTvl
};