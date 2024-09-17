const { sumTokens2 } = require('../helper/unwrapLPs')
const { request, gql } = require("graphql-request");

const GRAPH_QUERY = gql`
    query PositionQuery {
        positions {
            items {
                collateral
                position
            }
        }
    }
`;

const rpcUrl = 'https://ofd-ponder-production.up.railway.app';
let contractAddresses = []
let tokens = [
    '0x55d398326f99059fF775485246999027B3197955',
];

async function fetchContractAddresses() {
    try {
        const response = await request(rpcUrl, GRAPH_QUERY);

        response.positions.items.map((item) => {
            if (!tokens.includes(item.collateral)){
                tokens.push(item.collateral)
            }
            contractAddresses.push(item.position)
        });
        return contractAddresses;
    } catch (error) {
        console.error('Error fetching contract addresses:', error);
    }
}


async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    // Fetch contract addresses dynamically
    await fetchContractAddresses();

    // Sum token balances from the fetched contract addresses
    await sumTokens2({
        chain: 'bsc',
        block: chainBlocks.bsc,
        tokens,
        owners: contractAddresses, // Fetched contract addresses
        rpcUrl,
        balances,
    });

    return balances;
}

module.exports = {
    bsc: {
        tvl,
    },
};
