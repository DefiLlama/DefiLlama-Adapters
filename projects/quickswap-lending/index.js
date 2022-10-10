const { compoundExports } = require('../helper/compound')

const maticETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
const unitroller = "0x9BE35bc002235e96deC9d3Af374037aAf62BDeF7"
const wMatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  polygon: compoundExports(unitroller, "polygon", maticETH, wMatic),
}