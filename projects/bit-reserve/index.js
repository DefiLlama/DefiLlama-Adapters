const rBTC_CONTRACT = '0x473286faD076c050FB48a449c77d7434d947cE00';

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: rBTC_CONTRACT })
  return api.sumTokens({ owner: rBTC_CONTRACT, tokens })
}

module.exports = {
  methodology: 'The total value of BTC in the rBTC contract on the BIT-RESERVE platform.',
  start: '2024-05-17',
  core: {
    tvl
  }
}
