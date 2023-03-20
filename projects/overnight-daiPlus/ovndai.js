const sdk = require("@defillama/sdk");

const m2m = {
  optimism: "0x8416d215b71a5C91b04E326140bbbDcDa82C01da",
  arbitrum: "0xF04124F4226389d1Bf3ad7AcB54da05fF4078c8b",
}

const assets = {
  optimism: "0x970D50d09F3a656b43E11B0D45241a84e3a6e011", //DAI
  arbitrum: "0xeb8E93A0c7504Bffd8A8fFa56CD754c63aAeBFe8", //DAI
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