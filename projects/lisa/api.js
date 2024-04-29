const { call } = require('../helper/chain/stacks-api')

module.exports = {
  timetravel: false,
  stacks: { tvl }
}

async function tvl() {
  const reserveAddr = 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx';
  const registryAddr = 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.lqstx-mint-registry';
  const reserve = await call({ reserveAddr, abi: 'get-reserve' });
  const pending = await call({ registryAddr, abi: 'get-mint-requests-pending-amount'});
  return {
    blockstack: (reserve.value + pending.value) / 1e6
  }
}