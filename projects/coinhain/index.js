const { v3Tvl } = require("../helper/balancer")

const config = {
  bsc: { vault: '0xb61cb1E8EF4BB1b74bB858B8B60d82d79488F13D', fromBlock: 60471472},
}

Object.keys(config).forEach(chain => {
  const {vault, fromBlock,} = config[chain]
  module.exports[chain] = {
    tvl: v3Tvl(vault, fromBlock)
  }
})