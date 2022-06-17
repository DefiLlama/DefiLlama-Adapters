const utils = require('./utils')
const endpoint = "https://sushi-analytics.onrender.com/"
let _data

function getExports(protocol, chains) {
    const chainTvls = chains.reduce((obj, chain) => {
        obj[chain === 'avax' ? 'avalanche' : chain] = {
            tvl: async (timestamp) => {
                if(Math.abs(Date.now()/1000-timestamp) > 3600){
                    throw new Error("Can't refill adapters moved to heroku")
                }
                if (!_data) _data = utils.fetchURL(endpoint)
                const data = await _data
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