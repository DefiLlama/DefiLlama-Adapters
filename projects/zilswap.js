const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.zilstream.com/stats');
  return totalTvl.data.tvl;
}

module.exports = {
  fetch,
  methodology: `ZilSwap TVL is achieved by making a call to its API: https://api.zilstream.com/stats.`,
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: false,
  incentivized: true,
}
