const { tvl } = require('./v3.js')

const chains = ['ethereum', 'polygon', 'bsc', 'celo']

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1_634_320_800, 'V4 Launch'],
    [1_693_453_300, 'V5 Beta Launch'],
    [1_697_738_400, 'V5 Canary Launch'],
    [1_713_399_300, 'V5 Launch']
  ],
  methodology: `TVL is the total tokens deposited in PoolTogether`
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
