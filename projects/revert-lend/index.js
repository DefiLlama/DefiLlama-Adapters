const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    owners: ['0x74e6afef5705beb126c6d3bf46f8fad8f3e07825'],
  }
}

module.exports = {
  doublecounted: true
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ resolveUniV3: true, ...config[chain]})
  }
})