const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  polygon: {
    owners: ['0x8c696deF6Db3104DF72F7843730784460795659a']
  },
  evmos: {
    owners: ['0x3eb0fffa1470cdd3725b9eb29aded2736144b078']
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