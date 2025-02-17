const { call } = require('../helper/chain/stacks-api')

module.exports = {
  timetravel: false,
  stacks: { tvl }
}

async function tvl() {
  const reserveAddr = 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx';
  const registryAddr = 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.lqstx-mint-registry';
  const pending = await call({ target: registryAddr, abi: 'get-mint-requests-pending-amount'});
  const reserve = await call({ target: reserveAddr, abi: 'get-reserve' });
  return {
    blockstack: (+reserve.value + +pending.toString()) / 1e6
  }
}