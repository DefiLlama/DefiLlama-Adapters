const { sumTokensExport } = require('../helper/unwrapLPs')
const config = {
  avax: {
    owners: [
      '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
  },
  arbitrum: {
    owners: [
      '0xfA12DCB2e1FD72bD92E8255Db6A781b2c76adC20',
    ],
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain], fetchCoValentTokens: true, })
  }
})