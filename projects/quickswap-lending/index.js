const { compoundExports } = require('../helper/compound')

//pool name Open Market
const maticETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
const unitroller1 = "0x9BE35bc002235e96deC9d3Af374037aAf62BDeF7"
const wMatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
const miMatic = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1"

//pool name IB Market
const unitroller2 = "0x627742AaFe82EB5129DD33D237FF318eF5F76CBC"


//pool name IB Stable Market
const unitroller3 = "0x1eD65DbBE52553A02b4bb4bF70aCD99e29af09f8"



module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  polygon: compoundExports(unitroller1, unitroller2, unitroller3, "polygon", maticETH, wMatic, miMatic),
}