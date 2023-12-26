const { tvl } = require('./v3.js')

const chains = ['ethereum', 'polygon', 'bsc', 'celo']

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1_634_320_800, 'V4 Launch'],
    [1_658_872_800, 'V4 OP Rewards Begin'],
    [1_669_615_200, 'V4 OP Rewards Extended'],
    [1_697_738_400, 'V5 Launch']
  ],
  methodology: `TVL is the total tokens deposited in PoolTogether`
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
