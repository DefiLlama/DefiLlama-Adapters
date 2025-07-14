const { get } = require('../helper/http.js');

const url = "https://rest-embrmainnet-1.anvil.asia-southeast.initia.xyz/cosmos/bank/v1beta1/supply"

const assetMap = {
    "evm/4f7566f67941283a30cf65de7b9c6fdf2c04FCA1": {
        decimals: 18, id: "initia",
    },
}

module.exports = {
    timetravel: false,
    initia: {
        tvl: async () => {
            const balances = {}
            const res = await get(url)

            res.supply.map(({ denom, amount }) => {
                if (!assetMap[denom]) return
                const { decimals, id } = assetMap[denom]
                balances[id] = amount / 10 ** decimals
            })

            return balances
        },
    },
};