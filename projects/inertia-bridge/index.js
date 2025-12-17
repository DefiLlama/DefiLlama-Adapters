const { queryV1Beta1 } = require('../helper/chain/cosmos.js');


const mappings = {
    "l2/1f79a9647aca83c63014709b7d4a69dd0f017b87ce9adf7417a2e2aa1c49044f": {
        decimals: 6, id: "celestia",
    },
    // "l2/6f04a5de88d7587507e4b93e03999bfabce6e8a4131d94d226ac3a020196bc3d": {
    //     decimals: 6, id: "",
    // },
    "l2/93c226659c42299f98bdca46cf151a604a70be2e6391a61b67ae2311d556a46a": {
        decimals: 6, id: "usd-coin",
    },
    "l2/c88b68df2060ba982a80d3001afcb2d354031f6901df2391acb4f0e2f545c770": {
        decimals: 6, id: "initia",
    }
}

module.exports = {
    timetravel: false,
    initia: {
        tvl: async () => {
            const balances = {}
            const res = await queryV1Beta1({
                chain: "inertia",
                url: "/bank/v1beta1/supply",
            });

            res.supply.map(({ denom, amount }) => {
                if (denom in mappings) balances[`coingecko:${mappings[denom].id}`] = amount / 10 ** mappings[denom].decimals
                else if (denom.startsWith("ibc/")) balances[`${denom.replace("/", ":")}`] = amount
            })

            return balances
        },
    },
};