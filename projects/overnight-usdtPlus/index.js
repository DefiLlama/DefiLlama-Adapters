const ADDRESSES = require('../helper/coreAssets.json')

const m2m = {
  bsc: "0xF3434f6a11AA950150AF3e4962E39E6281496EF9",
  linea: "0x3d67655A49Adb0F44530233Cbf8375D33FfAde41",
  arbitrum: "0xf3607bB88738c3388b543d390a90B6ABF4046E3b",
}

const assets = {
  bsc: ADDRESSES.bsc.USDT, //USDT
  linea: ADDRESSES.linea.USDT, //USDT
  arbitrum: ADDRESSES.arbitrum.USDT //USDT
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