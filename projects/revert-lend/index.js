const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    owners: ['0x74e6afef5705beb126c6d3bf46f8fad8f3e07825'],
  },
  base: {
    owners: ['0x36aeae0e411a1e28372e0d66f02e57744ebe7599'],

  },
  ethereum: {
    owners: ['0xa2754543f69dC036764bBfad16d2A74F5cD15667'],

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
