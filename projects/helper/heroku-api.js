const utils = require('./utils')
const sdk = require('@defillama/sdk')
const endpoint = "https://sushi-analytics-defi.herokuapp.com/"

function getExports(protocol, chains) {
    async function tvl() {
        const data = await utils.fetchURL(endpoint)
        const balances = {}
        Object.values(data.data[protocol]).forEach(chain =>
            Object.entries(chain).forEach(balance =>
                sdk.util.sumSingleBalance(balances, balance[0], balance[1])
            )
        )
        return balances
    }

    const chainTvls = chains.reduce((obj, chain) => {
        obj[chain === 'avax' ? 'avalanche' : chain] = {
            tvl: async () => {
                const data = await utils.fetchURL(endpoint)
                if(data.data[protocol]?.[chain] === undefined){
                    throw new Error(`Data for protocol ${protocol} on chain ${chain} is undefined on heroku`)
                }
                return data.data[protocol][chain]
            }
        }
        return obj
    }, {})

    return {
        ...chainTvls,
        tvl
    }
}

module.exports={
    getExports
}