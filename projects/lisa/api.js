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

  const liALEXAddr = "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.auto-alex-v3";
  const liALEXSupply = await call({ target: liALEXAddr, abi: 'get-total-supply'});
  return {
    blockstack: (+reserve.value + +pending.toString()) / 1e6,
    alexgo: +liALEXSupply.value / 1e8
  }
}