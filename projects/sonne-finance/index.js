const { compoundExports } = require('../helper/compound')

const soWETH = "0xf7B5965f5C117Eb1B5450187c9DcFccc3C317e8E"
const unitroller = "0x60CF091cD3f50420d50fD7f707414d0DF4751C58"
const opWETH = "0x4200000000000000000000000000000000000006"

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  optimism: compoundExports(unitroller, "optimism", soWETH, opWETH),
}
