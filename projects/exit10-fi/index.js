const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    uniV3Holders: ['0xBFD697f71159Ed85eb1A7fE3520Ad8e5d61017fB'],
  },
  arbitrum: {
    uniV3Holders: ['0x6aC7197B8C41F8C72a82c49fb219be8ec421dbb0'],
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { uniV3Holders } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: uniV3Holders, resolveUniV3: true, })
  }
})