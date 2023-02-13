const { yieldHelper, } = require("../helper/yieldHelper")

const contract = '0x6a063c12aD67B7Ec793ad3E86E6a16177F01C12D'
const opt = '0xAd669b6cf06704e9D3b8D1d85A275623A1bD8288'

module.exports = yieldHelper({
  project: 'optitude-finance',
  chain: 'optimism',
  masterchef: contract,
  nativeToken: opt,
})