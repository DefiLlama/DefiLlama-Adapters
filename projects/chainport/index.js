const { get } = require('../helper/http')
let _resposne

async function getStats() {
  if (!_resposne) _resposne = get('https://api.chainport.io/api/tvl_per_chain')
  return _resposne
}

function fetchByNetwork(network_name) {
  return async () => ({
    tether: +(await getStats())[network_name]
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "assets in liquidity are counted as TVL",
  ethereum: {
    tvl: fetchByNetwork('ETHEREUM')
  },
  polygon: {
    tvl: fetchByNetwork('POLYGON')
  },
  bsc: {
    tvl: fetchByNetwork('BSC')
  },
  fantom: {
    tvl: fetchByNetwork('FANTOM')
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ],
}
