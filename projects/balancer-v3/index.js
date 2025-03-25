const { v3Tvl } = require("../helper/balancer")

const config = {
  xdai: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 37360338 },
  ethereum: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 21332121 },
  arbitrum: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 297810187 },
  base: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 25343854 },
}

Object.keys(config).forEach(chain => {
  const {vault, fromBlock,} = config[chain]
  module.exports[chain] = {
    tvl: v3Tvl(vault, fromBlock)
  }
})