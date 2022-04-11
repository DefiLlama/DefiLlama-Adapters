const utils = require('./utils')
const sdk = require('@defillama/sdk')
const endpoint = "https://sushi-analytics-defi.herokuapp.com/"

function getExports(protocol, chains) {
    const chainTvls = chains.reduce((obj, chain) => {
        obj[chain === 'avax' ? 'avalanche' : chain] = {
            tvl: async (timestamp) => {
                if(Math.abs(Date.now()/1000-timestamp) > 3600){
                    throw new Error("Can't refill adapters moved to heroku")
                }
                const data = await utils.fetchURL(endpoint)
                if(data.data[protocol]?.[chain] === undefined){
                    throw new Error(`Data for protocol ${protocol} on chain ${chain} is undefined on heroku`)
                }
                return data.data[protocol][chain]
            }
        }
        return obj
    }, {})

    return chainTvls
}

module.exports={
    getExports
}