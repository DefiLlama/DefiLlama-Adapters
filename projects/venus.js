const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var markets = await utils.fetchURL('https://api.venus.io/api/governance/venus')
  let tvl = 0;
  markets.data.data.markets.map(async(m) => {
    tvl += parseFloat(m.liquidity)
  })
  return tvl;
}


module.exports = {
  timetravel: false,
  methodology: 'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.',
  fetch,
}
