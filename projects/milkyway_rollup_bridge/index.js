const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

module.exports = {
    deadFrom: '2026-01-15', // project decides to shut down - https://x.com/milky_way_zone/status/2011770175566332325
    timetravel: false,
    initia: {
        tvl: async () => {
            const balances = {}
            const res = await queryV1Beta1({
                chain: "milkyway_rollup",
                url: "/bank/v1beta1/supply",
            });

            res.supply.map(({ denom, amount }) => {
                if (denom.startsWith("ibc/")) balances[`${denom.replace("/", ":")}`] = amount
            })

            return balances
        },
    },
};