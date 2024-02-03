const { call } = require('../helper/chain/stacks-api')

module.exports = {
  timetravel: false,
  stacks: { tvl }
}

async function tvl() {
  const target = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.reserve-v1'
  const currentCycle = await call({ target, abi: 'get-total-stx' })
  return {
    blockstack: currentCycle.value / 1e6
  }
}