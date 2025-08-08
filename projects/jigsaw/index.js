const {request, gql} = require("graphql-request")

const BASE_MAINNET_SUBGRAPH_URL = 'https://subgraph.satsuma-prod.com/5b49793e7bcd/jigsaw--557177/jigsaw-protocol/version/v0.0.1/api'

async function fetchAllSubgraphResults({url, query, field, variables = {}}) {
    let skip = 0;
    let allResults = [];
    let hasMore = true;
    while (hasMore) {
        const data = await request(url, query, {...variables, skip});
        const results = data[field];
        allResults = [...allResults, ...results];
        if (results.length < 1000) {
            hasMore = false;
        } else {
            skip += 1000;
        }
    }
    return allResults;
}

async function collaterals(_, _1, _2, {api}) {
    const query = gql`
        query GetCollaterals {
            collaterals { id, amount }
        }
    `;
    const allCollaterals = await fetchAllSubgraphResults({
        url: BASE_MAINNET_SUBGRAPH_URL,
        query,
        field: "collaterals",
    });

    for (const collateral of allCollaterals) {
        const underlyingAddress = collateral.id;
        if (!underlyingAddress) continue;
        api.add(underlyingAddress, collateral.amount);
    }
    return api.getBalances();
}

module.exports = {
    methodology: "TVL includes all collateral locked in the protocol",
    ethereum: {
        tvl: collaterals,
    },
}