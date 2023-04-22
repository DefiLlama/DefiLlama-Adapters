const utils = require('./helper/utils');
const { toUSDTBalances } = require('./helper/balances');

async function tvl() {
  const totalTVL = await utils.fetchURL('https://api.sigmaexplorer.org/sigmafi/tvl/summary');
  return toUSDTBalances(totalTVL);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    ergo:{
        tvl
    },
    methodology: 'SigmaFi TVL is achieved by making a call to its API: https://api.sigmaexplorer.org/sigmafi/tvl/summary API endpoint.'
}
