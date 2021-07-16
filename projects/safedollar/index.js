const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.safedollar.fi/api/public/tvl')
  return totalTvl.data.tvl
}
module.exports = {
  
  polygon: {
    fetch: fetch
  },
  fetch
}
