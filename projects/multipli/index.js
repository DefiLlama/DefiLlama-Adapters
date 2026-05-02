const axios = require('axios')
const API = "https://api.multipli.fi/multipli/v1/external-aggregator/defillama/tvl/"

const tvl = async (api) => {
  const { data } = await axios.get(API)
  return data.payload[api.chain]
}

const chains = ['ethereum', 'bsc', 'avax', 'base', 'monad', 'arbitrum']
module.exports.timetravel = false
chains.forEach(chain => { module.exports[chain] = { tvl } })
