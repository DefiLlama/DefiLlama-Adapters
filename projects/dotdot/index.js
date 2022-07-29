const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances');
const sdk = require('@defillama/sdk')

async function tvl() {
  var totalTvl = await utils.fetchURL('https://api.dotdot.finance/api/tvl')
  return toUSDTBalances(totalTvl.data.data.dddLpTvl);
}

async function staking() {
  var stakedTvl = await utils.fetchURL('https://api.dotdot.finance/api/tvl')
  return toUSDTBalances(stakedTvl.data.data.dddSupplyLockedUSD);
}


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc:{
    tvl,
    staking
  }
}
