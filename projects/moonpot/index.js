const utils = require('../helper/utils');

async function fetch() {
  const response = await utils.fetchURL('https://api.moonpot.com/tvl');
  return response.data.data.total.tvlUsd;
}

module.exports = {
  fetch
}