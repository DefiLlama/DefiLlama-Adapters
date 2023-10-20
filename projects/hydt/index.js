const { GraphQLClient } = require('graphql-request');

const graphURL = "https://api.thegraph.com/subgraphs/name/waleed-shafiq/hydt-protocol";

const stakedQuery = '{    volumes(        orderBy: blockTimestamp        orderDirection: desc        first: 1        where: { type: "Earn" }    ) {        amount    }}';
const priceQuery = '{    volumes(        orderBy: blockTimestamp        orderDirection: desc        first: 1        where: { type: "Price" }    ) {        amount    }}';

async function tvl(timestamp, block, _, { api }) {
    var graphQLClient = new GraphQLClient(graphURL);

    const staked = await graphQLClient.request(stakedQuery);
    const stakedAmount = staked.volumes[0].amount;

    const price = await graphQLClient.request(priceQuery);
    const priceHYDT = price.volumes[0].amount;

    const totalValueLockedUSD = (stakedAmount * priceHYDT) / 1e36;

    return {
        tether: totalValueLockedUSD
    }
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "We get amounts from the HYDT staking (earn) contract via the subgraph",
    start: 1693763345,
    bsc: {
        tvl,
    },
};
