const utils = require('./helper/utils');
const {toUSDTBalances} = require('./helper/balances')

async function tvl() {
  var totalTvl = await utils.fetchURL('https://api.spectrum.fi/v1/amm/platform/stats');
  return toUSDTBalances(totalTvl.data.tvl.value);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    ergo:{
        tvl
    },
    methodology: `Spectrum Finance TVL is achieved by making a call to its API: https://api.spectrum.fi/v1/amm/platform/stats.`
}
