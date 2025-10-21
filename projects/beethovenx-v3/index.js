const { v3Tvl } = require("../helper/balancer")

const config = {
  sonic: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 368135 },
}

Object.keys(config).forEach(chain => {
  const {vault, fromBlock,} = config[chain]
  module.exports[chain] = {
    tvl: v3Tvl(vault, fromBlock)
  }
})