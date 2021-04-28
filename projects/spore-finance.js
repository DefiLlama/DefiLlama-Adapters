const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://x-api.snowball.network/spore/tvl')
  return totalTvl.data;
}

module.exports = {
  fetch
}
