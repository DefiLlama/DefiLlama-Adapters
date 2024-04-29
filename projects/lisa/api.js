const { call } = require('../helper/chain/stacks-api')

module.exports = {
  timetravel: false,
  stacks: { tvl }
}

async function tvl() {
  const target = 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx'
  const currentCycle = await call({ target, abi: 'get-reserve' })
  return {
    blockstack: currentCycle.value / 1e6
  }
}