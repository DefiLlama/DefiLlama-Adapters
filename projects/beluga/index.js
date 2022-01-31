const utils = require('../helper/utils');

async function fetch() {
  let data = await utils.fetchURL('https://api.beluga.fi/tvl')
  return data.data.tvl;
}

module.exports = {
  fetch
}