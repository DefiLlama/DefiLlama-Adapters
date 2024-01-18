const { call } = require('../helper/chain/stacks-api')

module.exports = {
  timetravel: false,
  stacks: { tvl }
}

async function tvl() {
  const target = 'SP000000000000000000002Q6VF78.pox-3'
  const currentCycle = await call({ target, abi: 'current-pox-reward-cycle' })
  const stakedAmount = await call({ target, abi: 'get-total-ustx-stacked', inputArgs: [{ type: 'number', value: +(currentCycle.toString()) }] })
  return {
    blockstack: stakedAmount.toString() / 1e6
  }
}