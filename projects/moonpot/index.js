const utils = require('../helper/utils');

function fetchForNetwork(network) {
  return async () => {
    const response = await utils.fetchURL('https://api.moonpot.com/v2/tvl/' + network);
    return response.data.total;
  }
}

async function fetch() {
  const response = await utils.fetchURL('https://api.moonpot.com/v2/tvl');
  return response.data.total;
}

module.exports = {
  bsc: {
    fetch: fetchForNetwork('bsc')
  },
  fantom:{
    fetch: fetchForNetwork('fantom')
  },
  fetch
}