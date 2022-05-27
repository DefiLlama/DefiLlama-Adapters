const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances')

async function staking() {
  var totalTvl = await utils.fetchURL('https://ergopad.io/api/blockchain/tvl/d71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413');
  return toUSDTBalances(totalTvl.data.tvl.staked);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    ergo:{
        tvl: (async) => ({}),
        staking
    },  
    methodology: `Ergopad TVL is achieved by making a call to its API: https://ergopad.io/api/blockchain/tvl/d71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413 and consists of both staked ergopad tokens.`
}
