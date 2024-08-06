const { get } = require('../helper/http');

async function tvl() {
  var response = await get('https://api.scopuly.com/api/liquidity_pools_tvl');
  // Sort the response array by the 'time' field in descending order to get the most recent entry first
  response.sort((a, b) => b.time - a.time);
  var mostRecentTvl = response[0];
  return { tether: mostRecentTvl.tvl };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  stellar: { tvl },
}

