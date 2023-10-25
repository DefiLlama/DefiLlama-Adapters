const { tvl } = require('../pooltogether/v4.js')

const chains = ['ethereum', 'avax', 'polygon', 'optimism',]

module.exports = {
  doublecounted: true,
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
