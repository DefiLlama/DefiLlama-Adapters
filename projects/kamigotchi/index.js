const { get } = require('../helper/http.js');

const url = "https://rest-yominet-1.anvil.asia-southeast.initia.xyz/cosmos/bank/v1beta1/supply"

const ONYX = {
    address: "evm/4BaDFb501Ab304fF11217C44702bb9E9732E7CF4",
    decimals: 18,
    id: "kamigotchi-onyx",
}

const assetMap = {
    "evm/856aB2c9F35B9187aB3eB0Fcd11DCc6160427e96": {
        decimals: 18, id: "initia",
    },
    "evm/E1Ff7038eAAAF027031688E1535a055B2Bac2546": {
        decimals: 18, id: "ethereum",
    },
}

module.exports = {
    timetravel: false,
    yomi: {
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
        staking: async () => {
            const res = await get(url)
            const data = res.supply.find(asset => asset.denom == ONYX.address)

            return {
                [ONYX.id]: data.amount / 10 ** ONYX.decimals
            }
        }
    },
};