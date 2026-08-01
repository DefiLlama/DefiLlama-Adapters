const ADDRESSES = require('../helper/coreAssets.json')

const m2m = {
  optimism: "0x8416d215b71a5C91b04E326140bbbDcDa82C01da",
  arbitrum: "0xF04124F4226389d1Bf3ad7AcB54da05fF4078c8b",
  base: "0x7a62315519A39d562c1E49EB35b300d2E6742f86"
}

const assets = {
  optimism: ADDRESSES.optimism.DAI, //DAI
  arbitrum: ADDRESSES.optimism.DAI, //DAI
  base: ADDRESSES.base.DAI //DAI
}

const abi = "uint256:totalNetAssets"

module.exports = {};

Object.keys(m2m).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const bal = await api.call({  abi, target: m2m[chain]})
      api.add(assets[chain], bal)
    }
  }
})