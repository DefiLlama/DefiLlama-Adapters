const { compoundExports } = require('../helper/compound')
const { mergeExports } = require('../helper/utils')

//pool name Open Market
const unitroller1 = "0x9BE35bc002235e96deC9d3Af374037aAf62BDeF7"

//pool name IB Market
const unitroller2 = "0x627742AaFe82EB5129DD33D237FF318eF5F76CBC"

//pool name IB Stable Market
const unitroller3 = "0x1eD65DbBE52553A02b4bb4bF70aCD99e29af09f8"

const cExports = [unitroller1, unitroller2, unitroller3, ].map(i => ({
  polygon: compoundExports(i)
}))

module.exports = mergeExports([{
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
}, ...cExports])
module.exports.polygon.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 