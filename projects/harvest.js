const { get } = require('./helper/http')

// historical tvl on https://ethparser-api.herokuapp.com/api/transactions/history/alltvl?network=eth
const endpoint = "https://api.harvest.finance/vaults?key=41e90ced-d559-4433-b390-af424fdc76d6"
const chains = {
  ethereum: 'eth',
  // bsc: 'bsc',
  arbitrum: 'arbitrum',
  polygon: 'matic'
}

let _response

module.exports = {}
Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async () => {
      chain = chains[chain]
      if (!_response) _response = get(endpoint)
      const response = await _response
      var tvl = 0;
      Object.values(response[chain]).map(async item => {
        const poolTvl = parseFloat(item.totalValueLocked ?? 0)
        tvl += poolTvl
      })
      return { tether: tvl }
    }
  }
})