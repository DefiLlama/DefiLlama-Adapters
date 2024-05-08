const { tvl } = require('../pooltogether/v5.js')
const { hallmarks, methodology } = require('../pooltogether/constants.js')

const chains = ['optimism']

module.exports = {
  doublecounted: true,
  hallmarks,
  methodology
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
