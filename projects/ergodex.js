const utils = require('./helper/utils');
const {toUSDTBalances} = require('./helper/balances')

async function tvl() {
  var totalTvl = await utils.fetchURL('https://api.ergodex.io/v1/amm/platform/stats?from=1640131200000&to=1640302452170');
  return toUSDTBalances(totalTvl.data.tvl.value);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    ergo:{
        tvl
    },
    methodology: `ErgoDEX TVL is achieved by making a call to its API: https://api.ergodex.io/v1/amm/platform/stats?from=1640131200000&to=1640302452170.`
}