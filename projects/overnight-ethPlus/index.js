const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const m2m = {
  arbitrum: "0x672F0f9ECF78406E4E31cd531b0CefE32f0A84B5",
}

const assets = {
  arbitrum: ADDRESSES.arbitrum.WETH, //WETH
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