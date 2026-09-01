const ADDRESSES = require('../helper/coreAssets.json')

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
    tvl: async (api) => {
      const bal = await api.call({  abi, target: m2m[chain]})
      api.add(assets[chain], bal)
    }
  }
})