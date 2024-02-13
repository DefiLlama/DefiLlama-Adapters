const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  bsc: '0x1e70972EC6c8a3FAe3aC34C9F3818eC46Eb3BD5D',
  op_bnb: '0x2C5bF6f0953ffcDE678A35AB7d6CaEBC8B6b29F0',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens: [nullAddress], owner: config[chain] })
  }
})