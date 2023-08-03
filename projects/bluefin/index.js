const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// https://dapi.api.arbitrum-prod.firefly.exchange/marketData/contractAddresses
module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokens: [ADDRESSES.arbitrum.USDC], owner: '0x52b5471d04487fb85B39e3Ae47307f115fe8733F'})
  }
}