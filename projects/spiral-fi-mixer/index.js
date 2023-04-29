const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era: {
    tvl: sumTokensExport({ owner: '0xcd98e2C68248de044c3E44144C34D9EBb09337a9', tokens: [ADDRESSES.era.USDC]})
  }
}