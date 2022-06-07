const utils = require('./helper/utils');
const {fetchChainExports} = require('./helper/exports');

// historical tvl on https://ethparser-api.herokuapp.com/api/transactions/history/alltvl?network=eth
const endpoint = "https://api-ui.harvest.finance/vaults?key=41e90ced-d559-4433-b390-af424fdc76d6"
const chains = {
  ethereum: 'eth',
  bsc: 'bsc',
  polygon: 'matic'
}

function fetchChain(chainRaw) {
  const chain = chains[chainRaw]
  return async () => {
    var tvl = 0;
    var staked = await utils.fetchURL(endpoint)
    Object.values(staked.data[chain]).map(async item => {
      const poolTvl = parseFloat(item.totalValueLocked ?? 0)
      tvl += poolTvl
    })
    return tvl;
  }
}

module.exports = fetchChainExports(fetchChain, Object.keys(chains))
