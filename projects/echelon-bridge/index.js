const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

const mappings = {
    'l2/23c8396041db74441f4268d0c7e0533177dc3e028a47a8e584318f2d0c46fbe9': {
        decimals: 6, id: 'initia'
    }
}

module.exports = {
    timetravel: false,
    initia: {
        tvl: async () => {
            const balances = {}
            const res = await queryV1Beta1({
                chain: "echelon_initia",
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