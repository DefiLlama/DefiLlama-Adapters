const { tvl } = require('../pooltogether/v5.js')

const chains = ['optimism', 'base', 'arbitrum', 'ethereum', 'scroll', 'xdai']

module.exports = {
  doublecounted: true,
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
