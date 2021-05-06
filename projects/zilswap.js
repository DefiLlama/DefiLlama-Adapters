const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.zilstream.com/stats');
  return totalTvl.data.tvl;
}

module.exports = {
  fetch
}
