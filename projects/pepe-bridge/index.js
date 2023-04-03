const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');

const config = {
  ethereum: [
    [[nullAddress], '0x882260324AD5A87bF5007904B4A8EF87023c856A']
  ]
}
module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport({ ownerTokens: config[chain] }) }
})