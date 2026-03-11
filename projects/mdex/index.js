const { getUniTVL } = require('../helper/unknownTokens')

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
  bittorrent: "0x36117cc868139FA3AeD4067142C5EF3C121c6a72"
};

module.exports = {
    misrepresentedTokens: true,
};

Object.keys(factories).forEach(chain => {
  const factory = factories[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true })
  }
})

Object.keys(module.exports.heco).forEach(key => module.exports.heco[key] = () => ({}))