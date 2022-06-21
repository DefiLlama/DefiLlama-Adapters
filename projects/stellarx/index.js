const utils = require('../helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://amm-api.stellarx.com/api/pools/30d-statistic/?pool_string=');
  return totalTvl.data[totalTvl.data.length-1].liquidity;
}

module.exports = {
  fetch,
  
}