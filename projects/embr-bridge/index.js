const { get } = require('../helper/http.js');

const url = "https://rest-embrmainnet-1.anvil.asia-southeast.initia.xyz/cosmos/bank/v1beta1/supply"

module.exports = {
    timetravel: false,
    initia: {
        tvl: async () => {
            const balances = {}
            const res = await get(url)

            res.supply.map(({ denom, amount }) => {
                if (!denom.startsWith("evm/")) return 
                balances[`embr:${denom.replace("evm/", "0x")}`] = amount
            })

            return balances
        },
    },
};