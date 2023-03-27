const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/http');

const graph_endpoint = 'https://api.thegraph.com/subgraphs/name/rout-horizon/bsc15-issuance'
const graphQuery = gql`
query get_tvl($block: Int) {
  snxholders(orderBy:collateral,orderDirection:desc,block: { number: $block },first:1000,skip:0, where: {initialDebtOwnership_gt: 0, debtEntryAtIndex_gt: 0}) {
    collateral
  }
}`

async function tvl(ts, _block, chainBlocks) {
    const block = await getBlock(ts, 'bsc', chainBlocks)
    const { snxholders } = await request(
        graph_endpoint,
        graphQuery,
        { block: block - 1000 }
    );

    var totalCollateral = 0;
    for (const { collateral } of snxholders) {
        totalCollateral += +collateral        // sum of every user's collateral
    }

    return { 'bsc:0xc0eff7749b125444953ef89682201fb8c6a917cd': totalCollateral * 10 ** 18 };
}

module.exports = {
    collateral: tvl
}