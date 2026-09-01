const { get } = require('../helper/http.js');

const url = "https://rest-yominet-1.anvil.asia-southeast.initia.xyz/cosmos/bank/v1beta1/supply"

const ONYX = {
    address: "evm/4BaDFb501Ab304fF11217C44702bb9E9732E7CF4",
    decimals: 18,
    id: "kamigotchi-onyx",
}

module.exports = {
    timetravel: false,
    yomi: {
        tvl: async () => {
            const balances = {}
            const res = await get(url)

            res.supply.map(({ denom, amount }) => {
                let id;
                if (denom.startsWith("evm/")) {
                    id = `yomi:${denom.replace("evm/", "0x")}`
                } else if (denom.startsWith("ibc/")) {
                    id = denom.replace("/", ":")
                } 
                balances[id] = amount 
            })

            return balances
        },
        staking: async () => {
            const res = await get(url)
            const data = res.supply.find(asset => asset.denom == ONYX.address)

            return {
                [ONYX.id]: data.amount / 10 ** ONYX.decimals
            }
        }
    },
};