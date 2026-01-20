const rBTC_CONTRACT = '0x473286faD076c050FB48a449c77d7434d947cE00';
const RS_CONTRACT = '0x3192bE801D2C4f1B5B4A070e7c4097Ba0f23412A';

async function coreTvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: rBTC_CONTRACT })
  return api.sumTokens({ owner: rBTC_CONTRACT, tokens })
}

async function sonicTvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: RS_CONTRACT })
  return api.sumTokens({ owner: RS_CONTRACT, tokens })
}

module.exports = {
  methodology: 'TVL is calculated by summing all token balances. For core chain, it uses the rBTC contract balances. For Sonic chain, it uses the RS  contract LST‘s balance',
  start: '2024-05-17',
  core: {
    tvl: coreTvl
  },
  sonic: {
    tvl: sonicTvl
  }
}
