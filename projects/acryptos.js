const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var staked = await utils.fetchURL('https://api.unrekt.net/api/v1/acryptos-asset')
  let tvl  = 0;
  for (const [key, p] of Object.entries(staked.data.assets)) {
    tvl += parseFloat(p.tvl_usd)
  }
  return tvl;
}

module.exports = {
  fetch
}
