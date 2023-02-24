const BigNumberJs = require("bignumber.js");
BigNumberJs.config({ EXPONENTIAL_AT: 1e9 })

const toBigNumberJsOrZero = (value) => {
  const bn = new BigNumberJs(value)
  return bn.isNaN() ? new BigNumberJs('0') : bn
}
  
module.exports = {
  toBigNumberJsOrZero
}
