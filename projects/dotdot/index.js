const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances');
const sdk = require('@defillama/sdk')

async function tvl() {
  var totalTvl = await utils.fetchURL('https://api.dotdot.finance/api/tvl')
  return toUSDTBalances(totalTvl.data.data.dddLpTvl);
}


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc:{
    tvl
  }
}
