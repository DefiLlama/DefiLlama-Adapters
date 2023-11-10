const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  base: '0xE173A25C522385BB117b3044C79F534cD0a895EC'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens: [nullAddress], owner: config[chain] })
  }
})
