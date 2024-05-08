const { tvl } = require('../pooltogether/v4.js')
const { hallmarks, methodology } = require('../pooltogether/constants.js')

const chains = ['ethereum', 'avax', 'polygon', 'optimism',]

module.exports = {
  doublecounted: true,
  hallmarks,
  methodology
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
