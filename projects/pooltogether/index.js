const { tvl } = require('./v3.js')
const { hallmarks, methodology } = require('./constants.js')

const chains = ['ethereum', 'polygon', 'bsc', 'celo']

module.exports = {
  doublecounted: true,
  hallmarks,
  methodology
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
