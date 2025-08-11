const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

module.exports = {
    timetravel: false,
    embr: {
        tvl: async () => {
            const balances = {}
            const res = await queryV1Beta1({
                chain: "embr",
                url: "/bank/v1beta1/supply",
            });

            res.supply.map(({ denom, amount }) => {
                if (!denom.startsWith("evm/")) return 
                balances[`embr:${denom.replace("evm/", "0x")}`] = amount
            })

            return balances
        },
    },
};