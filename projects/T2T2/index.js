const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

const config = {
  ethereum: '0x390e61F798267fe7aa9BBE61Be8BB1776250D44C',
  base: '0xE173A25C522385BB117b3044C79F534cD0a895EC',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens: [nullAddress], owner: config[chain] })
  }
})
