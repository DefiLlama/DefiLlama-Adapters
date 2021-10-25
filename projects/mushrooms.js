const utils = require('./helper/utils');

function fetchChain(chainId) {
  return async () => {
    const response = await utils.fetchURL(`https://swapoodxoh.execute-api.ap-southeast-1.amazonaws.com/tvl?chainId=${chainId}`);
    if (response.data) {
      return response.data.result
    } else {
      return 0
    }
  }
}

// https://github.com/mushroomsforest/deployment/blob/main/apis.md
const chains = {
  "ethereum": 1,
  "bsc": 56,
  "fantom": 250,
  "polygon": 137
}

const chainExports = Object.entries(chains).reduce((t,chain)=>({
  ...t,
  [chain[0]]:{
    fetch: fetchChain(chain[1])
  }
}), {})

async function fetch() {
  return (await Promise.all(Object.values(chains).map(id=>fetchChain(id)()))).reduce((a,t)=>t+a, 0)
}
// node test.js projects/mushrooms.js
module.exports = {
  ...chainExports,
  fetch
}
