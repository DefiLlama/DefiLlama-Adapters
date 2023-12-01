const { request, gql } = require('graphql-request');

const endpoint = 'https://api.thegraph.com/subgraphs/name/0xandee/arcanedex';

const GET_GLOBAL_STATS = gql`
    query {
        globalStats(id: "global_stats") {
            totalSwaps
            totalVolumeInEth
        }
    }
`;

async function getGlobalStats() {
    try {
        const data = await request(endpoint, GET_GLOBAL_STATS);
        return data.globalStats;
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
}

module.exports = {
    timetravel: false,
    start: async () => {
        const stats = await getGlobalStats();
        if (stats) {
            console.log(`Total Swaps: ${stats.totalSwaps}`);
            console.log(`Total Volume in ETH: ${stats.totalVolumeInEth}`);
        }
    },
    arbitrum: {
        tvl
    }
};
