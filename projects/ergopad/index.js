const utils = require('../helper/utils');

async function staking() {
  const { data: { 'Total amount staked': totalStaked } } = await utils.fetchURL('https://api.ergopad.io/staking/status/');
  return {
    'ergo:d71693c49a84fbbecd4908c94813b46514b18b67a99952dc1e6e4791556de413': totalStaked * 1e2
  }
}

module.exports = {
  timetravel: false,
  ergo: {
    tvl: () => ({}),
    staking
  },
}
