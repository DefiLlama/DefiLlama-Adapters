const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var tvl = 0;
  var staked = await utils.fetchURL('https://api.harvest.finance/cmc?key=fc8ad696-7905-4daa-a552-129ede248e33')
  staked.data.pools.map(async item => {
    tvl += parseFloat(item.totalStaked)
  })
  return tvl;
}

module.exports = {
  fetch
}
