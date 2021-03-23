const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.pangolin.exchange/png/tvl')
  return totalTvl.data;
}

module.exports = {
  fetch
}
