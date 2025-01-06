const { uniV3Export } = require("../helper/uniswapV3");
const { staking } = require("../helper/staking");

module.exports = uniV3Export({
  linea: {
    factory: "0x622b2c98123D303ae067DB4925CD6282B3A08D0F",
    fromBlock: 143660,
    isAlgebra: true,
  },
})

module.exports.linea.staking = staking("0x8D95f56b0Bac46e8ac1d3A3F12FB1E5BC39b4c0c", "0x1a51b19CE03dbE0Cb44C1528E34a7EDD7771E9Af")
