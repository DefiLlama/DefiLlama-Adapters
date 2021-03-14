const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var pools = await utils.fetchURL('https://api.venus.io/api/pool')
  let tvl = 0;
  pools.data.pools.map(async(p) => {
    tvl += parseFloat(p.totalStaked)
  })
  return tvl;
}

module.exports = {
  fetch
}
