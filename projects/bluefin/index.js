const { sumTokensExport } = require('../helper/unwrapLPs')

// https://dapi.api.arbitrum-prod.firefly.exchange/marketData/contractAddresses
module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokens: ['0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'], owner: '0x52b5471d04487fb85B39e3Ae47307f115fe8733F'})
  }
}