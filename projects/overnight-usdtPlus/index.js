const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const m2m = {
  bsc: "0xF3434f6a11AA950150AF3e4962E39E6281496EF9",
}

const assets = {
  bsc: ADDRESSES.bsc.USDT, //USDT
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