const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const m2m = {
  optimism: "0x8416d215b71a5C91b04E326140bbbDcDa82C01da",
  arbitrum: "0xF04124F4226389d1Bf3ad7AcB54da05fF4078c8b",
}

const assets = {
  optimism: ADDRESSES.optimism.DAI, //DAI
  arbitrum: ADDRESSES.optimism.DAI, //DAI
}

const abi = "uint256:totalNetAssets"

module.exports = {};

Object.keys(m2m).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, cb) => {
      const block = cb[chain]
      const { output } = await sdk.api.abi.call({ chain, block, abi, target: m2m[chain]})
      return {
        [`${chain}:${assets[chain]}`]: output
      }
    }
  }
})