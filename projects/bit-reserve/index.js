const rBTC_CONTRACT = '0xBf4df43f72d27a7b1D2fC295aeca58e0853f922F';

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'approvedTokens', itemAbi: 'approvedRestakedLSTs', target: rBTC_CONTRACT })
  return api.sumTokens({ owner: rBTC_CONTRACT, tokens })
}

module.exports = {
  methodology: 'The total value of BTC in the rBTC contract on the BIT-RESERVE platform.',
  start: 1715917267,
  core: {
    tvl
  }
}