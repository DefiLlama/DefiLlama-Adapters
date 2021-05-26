const utils = require('./helper/utils');

async function fetch() {
  const response = await utils.fetchURL('https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools')
  return response.data.reduce((tvl, pool)=>tvl + pool.liquidity_locked, 0);
}

module.exports = {
  fetch
}
