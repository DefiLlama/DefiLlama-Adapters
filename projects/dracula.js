const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var tvl = 0;
  var staked = await utils.fetchURL('https://dracula.sucks/api/stats')
  staked.data.victimPools.map(pool => {
    tvl += pool.tvl
  })
  return tvl;
}

module.exports = {
  fetch
}
