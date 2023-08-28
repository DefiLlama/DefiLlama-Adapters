const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  era: {
    tvl: sumTokensExport({ owner: '0xcd98e2C68248de044c3E44144C34D9EBb09337a9', tokens: [ADDRESSES.era.USDC]})
  },
  polygon_zkevm: {
    tvl: sumTokensExport({owner: '0x96DaD05740807e76892076684F433D5E0b3569fB', tokens: [ADDRESSES.polygon_zkevm.USDC]})
  }
}